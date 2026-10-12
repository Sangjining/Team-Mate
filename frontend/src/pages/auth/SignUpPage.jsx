import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  loginIdRegex,
  passwordRegex,
  nameRegex,
  emailRegex,
} from '../../utils/validation';

import styles from './SignUpPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function SignUpPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState('');
  const [apiError, setApiError] = useState('');

  const postAuth = async (path, body) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    if (!response.ok) {
      let message = text;
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.error || message;
      } catch { /* plain-text error */ }
      throw new Error(message && message.length < 250 ? message : `요청에 실패했습니다. (HTTP ${response.status})`);
    }
    return text;
  };

  const errorMessage = (error) => error instanceof TypeError
    ? '서버에 연결할 수 없습니다. 백엔드 실행 상태를 확인해주세요.'
    : error.message || '요청 중 오류가 발생했습니다.';

  const [form, setForm] = useState({
    loginId: '',
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    verificationCode: '',
  });

  const [errors, setErrors] = useState({});
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setApiError('');

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 입력값 변경 시 해당 오류 제거
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    // 이메일 변경 시 인증 상태 초기화
    if (name === 'email') {
      setEmailSent(false);
      setEmailVerified(false);
      setErrors((prev) => ({
        ...prev,
        email: '',
        verificationCode: '',
      }));
    }
  };

  // 입력값 유효성 검사
  const validateForm = () => {
    const newErrors = {};

    if (!loginIdRegex.test(form.loginId)) {
      newErrors.loginId =
        '아이디는 영문 소문자와 숫자 4~20자로 입력해주세요.';
    }

    if (!nameRegex.test(form.name)) {
      newErrors.name =
        '이름은 한글 또는 영문 2~20자로 입력해주세요.';
    }

    if (!emailRegex.test(form.email)) {
      newErrors.email =
        '올바른 이메일 형식으로 입력해주세요.';
    }

    if (!passwordRegex.test(form.password)) {
      newErrors.password =
        '영문, 숫자, 특수문자를 포함하여 8~20자로 입력해주세요.';
    }

    if (form.password !== form.passwordConfirm) {
      newErrors.passwordConfirm =
        '비밀번호가 일치하지 않습니다.';
    }

    if (!emailVerified) {
      newErrors.verificationCode =
        '이메일 인증을 완료해주세요.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // 이메일 인증번호 발송
  const handleSendCode = async () => {
    if (loading) return;
    if (!emailRegex.test(form.email)) {
      setErrors((prev) => ({ ...prev, email: '올바른 이메일을 입력해주세요.' }));
      return;
    }
    setLoading('send');
    setApiError('');
    try {
      await postAuth('email/send', { email: form.email.trim() });
      setEmailSent(true);
      setEmailVerified(false);
      setForm((prev) => ({ ...prev, verificationCode: '' }));
      alert('인증번호를 이메일로 발송했습니다. (유효기간 5분)');
    } catch (error) {
      setApiError(errorMessage(error));
    } finally {
      setLoading('');
    }
  };

  // 이메일 인증번호 확인
  const handleVerifyCode = async () => {
    if (loading) return;
    if (!/^\d{6}$/.test(form.verificationCode.trim())) {
      setErrors((prev) => ({ ...prev, verificationCode: '6자리 인증번호를 입력해주세요.' }));
      return;
    }
    setLoading('verify');
    setApiError('');
    try {
      await postAuth('email/verify', {
        email: form.email.trim(),
        code: form.verificationCode.trim(),
      });
      setEmailVerified(true);
      setErrors((prev) => ({ ...prev, verificationCode: '' }));
      alert('이메일 인증이 완료되었습니다.');
    } catch (error) {
      setErrors((prev) => ({ ...prev, verificationCode: errorMessage(error) }));
    } finally {
      setLoading('');
    }
  };

  // 회원가입
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !validateForm()) return;
    setLoading('signup');
    setApiError('');
    try {
      await postAuth('signup', {
        loginId: form.loginId.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/auth/login', { replace: true });
    } catch (error) {
      setApiError(errorMessage(error));
    } finally {
      setLoading('');
    }
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>

        <div className={styles.header}>
          <h1 className={styles.logo}>Team-Mate</h1>
          <h2>회원가입</h2>
          <p>Team-Mate와 함께 협업을 시작하세요.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.signupForm}>

          {/* 아이디 */}
          <div className={styles.inputGroup}>
            <label htmlFor="loginId">아이디</label>
            <input
              id="loginId"
              name="loginId"
              type="text"
              placeholder="영문 소문자, 숫자 4~20자"
              value={form.loginId}
              onChange={handleChange}
              maxLength={20}
              autoComplete="username"
            />
            {errors.loginId && (
              <span className={styles.error}>{errors.loginId}</span>
            )}
          </div>

          {/* 이름 */}
          <div className={styles.inputGroup}>
            <label htmlFor="name">이름</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="이름을 입력하세요"
              value={form.name}
              onChange={handleChange}
              maxLength={20}
              autoComplete="name"
            />
            {errors.name && (
              <span className={styles.error}>{errors.name}</span>
            )}
          </div>

          {/* 이메일 */}
          <div className={styles.inputGroup}>
            <label htmlFor="email">이메일</label>

            <div className={styles.inlineInput}>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                disabled={emailVerified || Boolean(loading)}
                autoComplete="email"
              />

              <button
                type="button"
                onClick={handleSendCode}
                disabled={emailVerified || Boolean(loading)}
                className={styles.secondaryButton}
              >
                {emailVerified ? '인증완료' : '인증번호 발송'}
              </button>
            </div>

            {errors.email && (
              <span className={styles.error}>{errors.email}</span>
            )}
          </div>

          {/* 이메일 인증 */}
          {emailSent && !emailVerified && (
            <div className={styles.inputGroup}>
              <label htmlFor="verificationCode">인증번호</label>

              <div className={styles.inlineInput}>
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  inputMode="numeric"
                  placeholder="6자리 인증번호"
                  value={form.verificationCode}
                  onChange={handleChange}
                  maxLength={6}
                />

                <button
                  type="button"
                  onClick={handleVerifyCode}
                  disabled={Boolean(loading)}
                  className={styles.secondaryButton}
                >
                  인증 확인
                </button>
              </div>

              {errors.verificationCode && (
                <span className={styles.error}>
                  {errors.verificationCode}
                </span>
              )}
            </div>
          )}

          {/* 비밀번호 */}
          <div className={styles.inputGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="영문, 숫자, 특수문자 포함 8~20자"
              value={form.password}
              onChange={handleChange}
              maxLength={20}
              autoComplete="new-password"
            />

            {errors.password && (
              <span className={styles.error}>{errors.password}</span>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className={styles.inputGroup}>
            <label htmlFor="passwordConfirm">비밀번호 확인</label>
            <input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={form.passwordConfirm}
              onChange={handleChange}
              maxLength={20}
              autoComplete="new-password"
            />

            {errors.passwordConfirm && (
              <span className={styles.error}>
                {errors.passwordConfirm}
              </span>
            )}
          </div>

          {apiError && <p role="alert" className={styles.error}>{apiError}</p>}

          <button type="submit" disabled={Boolean(loading)} className={styles.signupButton}>
            {loading === 'signup' ? '가입 처리 중...' : '회원가입'}
          </button>
        </form>

        <div className={styles.footer}>
          <span>이미 계정이 있으신가요?</span>
          <Link to="/auth/login">로그인</Link>
        </div>

      </div>
    </div>
  );
}

export default SignUpPage;