import { useEffect, useState } from 'react';
import styles from './MyPage.module.css';
import { useTheme } from '../../context/ThemeContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function MyPage() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [passwordStep, setPasswordStep] = useState(0);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);

  async function passwordRequest(path, method, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const message = await response.text();
    if (!response.ok) throw new Error(message || `요청 실패 (HTTP ${response.status})`);
    return message;
  }

  async function handlePasswordAction(action) {
    setPasswordBusy(true);
    setPasswordError('');
    setPasswordMessage('');
    try {
      if (action === 'send') {
        await passwordRequest('/api/users/me/password/email/send', 'POST');
        setPasswordStep(1);
        setPasswordMessage('가입한 이메일로 인증번호를 발송했습니다. (5분 유효)');
      } else if (action === 'verify') {
        if (!/^\d{6}$/.test(code)) throw new Error('6자리 인증번호를 입력해 주세요.');
        await passwordRequest('/api/users/me/password/email/verify', 'POST', { code });
        setPasswordStep(2);
        setPasswordMessage('인증되었습니다. 새 비밀번호를 입력해 주세요.');
      } else if (action === 'change') {
        if (newPassword.length < 8 || newPassword.length > 72) throw new Error('비밀번호는 8~72자로 입력해 주세요.');
        if (newPassword !== confirmPassword) throw new Error('새 비밀번호 확인이 일치하지 않습니다.');
        await passwordRequest('/api/users/me/password', 'PATCH', { newPassword });
        localStorage.removeItem('token');
        window.location.replace('/auth/login');
      }
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordBusy(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('로그인이 필요합니다.');
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
        });
        if (!response.ok) throw new Error(`계정 정보를 불러오지 못했습니다. (HTTP ${response.status})`);
        const data = await response.json();
        if (!controller.signal.aborted) setUser(data);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    window.location.replace('/');
  }

  if (loading) return <div className={styles.page}><p>계정 정보를 불러오는 중입니다...</p></div>;
  if (error) return <div className={styles.page}><p className={styles.error} role="alert">{error}</p></div>;

  const displayName = user?.name || user?.loginId || '사용자';
  return (
    <div className={styles.page}>
      <div className={styles.heading}><h1>마이페이지</h1><p>내 계정 정보를 확인하고 관리하세요.</p></div>
      <section className={styles.card}>
        <div className={styles.identity}>
          <div className={styles.avatar}>{displayName.charAt(0).toUpperCase()}</div>
          <div><h2>{displayName}</h2><p>@{user?.loginId || '-'}</p></div>
        </div>
        <div className={styles.details}>
          <div className={styles.row}><span>아이디</span><strong>{user?.loginId || '-'}</strong><small>변경 불가</small></div>
          <div className={styles.row}><span>이름</span><strong>{user?.name || '-'}</strong><small>읽기 전용</small></div>
          <div className={styles.row}><span>이메일</span><strong>{user?.email || '-'}</strong><small>읽기 전용</small></div>
        </div>
      </section>
      <section className={styles.card}>
        <div className={styles.sectionBody}>
          <h2>🔐 비밀번호 변경</h2>
          <p>가입 이메일({user?.email}) 인증 후 비밀번호를 변경할 수 있습니다.</p>
          {passwordStep === 0 && (
            <button className={styles.actionButton} type="button" disabled={passwordBusy}
              onClick={() => handlePasswordAction('send')}>
              {passwordBusy ? '발송 중...' : '인증번호 발송'}
            </button>
          )}
          {passwordStep === 1 && (
            <div className={styles.passwordForm}>
              <label htmlFor="passwordCode">이메일 인증번호</label>
              <input id="passwordCode" value={code} maxLength={6} inputMode="numeric"
                autoComplete="one-time-code" placeholder="6자리 인증번호"
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
              <div className={styles.passwordActions}>
                <button className={styles.actionButton} type="button" disabled={passwordBusy}
                  onClick={() => handlePasswordAction('verify')}>인증 확인</button>
                <button className={styles.outlineButton} type="button" disabled={passwordBusy}
                  onClick={() => handlePasswordAction('send')}>재발송 (60초 간격)</button>
              </div>
            </div>
          )}
          {passwordStep === 2 && (
            <form className={styles.passwordForm} onSubmit={(e) => { e.preventDefault(); handlePasswordAction('change'); }}>
              <label htmlFor="newPassword">새 비밀번호 (8~72자)</label>
              <input id="newPassword" type="password" autoComplete="new-password"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} maxLength={72} />
              <label htmlFor="confirmPassword">새 비밀번호 확인</label>
              <input id="confirmPassword" type="password" autoComplete="new-password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <button className={styles.actionButton} type="submit" disabled={passwordBusy}>
                {passwordBusy ? '변경 중...' : '비밀번호 변경'}</button>
            </form>
          )}
          {passwordMessage && <p className={styles.passwordSuccess} role="status">{passwordMessage}</p>}
          {passwordError && <p className={styles.passwordError} role="alert">{passwordError}</p>}
        </div>
      </section>
      <section className={styles.card}>
        <div className={styles.sectionBody}>
          <h2>🎨 화면 설정</h2>
          <p>Team-Mate의 화면 테마를 선택하세요. 선택한 설정은 이 브라우저에 저장됩니다.</p>
          <div className={styles.themeOptions} role="group" aria-label="화면 테마 선택">
            {[
              { value: 'light', icon: '☀️', label: '라이트', description: '밝은 화면' },
              { value: 'dark', icon: '🌙', label: '다크', description: '어두운 화면' },
              { value: 'system', icon: '💻', label: '시스템', description: '기기 설정에 맞춤' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.themeOption} ${theme === option.value ? styles.themeOptionActive : ''}`}
                onClick={() => setTheme(option.value)}
                aria-pressed={theme === option.value}
              >
                <span className={styles.themeIcon} aria-hidden="true">{option.icon}</span>
                <span className={styles.themeLabel}>{option.label}</span>
                <span className={styles.themeDescription}>{option.description}</span>
                {theme === option.value && <span className={styles.themeCheck}>✓ 선택됨</span>}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.card}>
        <div className={styles.sectionBody}>
          <h2>🚪 계정 관리</h2>
          <p>현재 계정에서 로그아웃하고 Team-Mate 소개 페이지로 돌아갑니다.</p>
          <button className={styles.logoutButton} type="button" onClick={handleLogout}>로그아웃</button>
        </div>
      </section>
    </div>
  );
}
