import { NavLink, Outlet } from 'react-router-dom';
import styles from './MainLayout.module.css';

function MainLayout() {
  const menuItems = [
    { path: '/', label: '대시보드', icon: '🏠', end: true },
    { path: '/teams', label: '내 팀', icon: '👥' },
    { path: '/tasks', label: '내 업무', icon: '📋' },
    { path: '/schedule', label: '일정 관리', icon: '📅' },
  ];

  return (
    <div className={styles.layout}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <div className={styles.logo}>Team-Mate</div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.notificationButton}
            aria-label="알림"
          >
            🔔
          </button>

          <div className={styles.profile}>
            <div className={styles.avatar}>U</div>
            <span>사용자</span>
          </div>
        </div>
      </header>

      <div className={styles.body}>
        {/* 왼쪽 사이드바 */}
        <aside className={styles.sidebar}>
          <nav className={styles.navigation}>
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `${styles.navItem} ${
                    isActive ? styles.active : ''
                  }`
                }
              >
                <span className={styles.navIcon}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className={styles.sidebarBottom}>
            <NavLink
              to="/mypage"
              className={({ isActive }) =>
                `${styles.navItem} ${
                  isActive ? styles.active : ''
                }`
              }
            >
              <span className={styles.navIcon}>⚙️</span>
              <span>설정</span>
            </NavLink>
          </div>
        </aside>

        {/* 페이지 콘텐츠 */}
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;