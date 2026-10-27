import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './MainLayout.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function MainLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const menuItems = [
    { path: '/dashboard', label: '대시보드', icon: '🏠', end: true },
    { path: '/teams', label: '내 팀', icon: '👥' },
    { path: '/tasks', label: '내 업무', icon: '📋' },
    { path: '/schedule', label: '일정 관리', icon: '📅' },
  ];

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');
    if (!token) return () => controller.abort();
    fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }, signal: controller.signal,
    }).then((response) => response.ok ? response.json() : null)
      .then((data) => { if (!controller.signal.aborted) setUser(data); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const displayName = user?.name || user?.loginId || '사용자';
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>Team-Mate</div>
        <div className={styles.headerRight}>
          <button type="button" className={styles.notificationButton} aria-label="알림">🔔</button>
          <button type="button" className={styles.profile} onClick={() => navigate('/mypage')} title="마이페이지로 이동">
            <div className={styles.avatar}>{displayName.charAt(0).toUpperCase()}</div>
            <span>{displayName}</span>
          </button>
        </div>
      </header>
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <nav className={styles.navigation}>
            {menuItems.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.end}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                <span className={styles.navIcon}>{item.icon}</span><span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className={styles.sidebarBottom}>
            <NavLink to="/mypage" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
              <span className={styles.navIcon}>⚙️</span><span>마이페이지</span>
            </NavLink>
          </div>
        </aside>
        <main className={styles.mainContent}><Outlet /></main>
      </div>
    </div>
  );
}

export default MainLayout;
