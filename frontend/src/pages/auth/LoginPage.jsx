import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function LoginPage() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: loginId.trim(), password }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403 || response.status === 400) {
          throw new Error('아이디 또는 비밀번호를 확인해주세요.');
        }
        throw new Error(`로그인 요청에 실패했습니다. (HTTP ${response.status})`);
      }

      const data = await response.json();
      if (!data.token) {
        throw new Error('로그인 응답에 인증 토큰이 없습니다.');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        userId: data.userId,
        loginId: data.loginId,
        name: data.name,
        profileId: data.profileId,
        role: data.role,
      }));

      navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof TypeError) {
        setError('서버에 연결할 수 없습니다. 백엔드 실행 상태와 CORS 설정을 확인해주세요.');
      } else {
        setError(err.message || '로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.logo}>Team-Mate</h1>
          <p className={styles.subtitle}>팀의 모든 업무를 한곳에서 관리하세요.</p>
        </div>

        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="loginId">아이디</label>
            <input
              id="loginId"
              type="text"
              placeholder="아이디를 입력하세요"
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <button type="submit" className={styles.loginButton} disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className={styles.footer}>
          <span>아직 계정이 없으신가요?</span>
          <Link to="/auth/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
