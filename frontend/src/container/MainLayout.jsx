import { useCallback, useEffect, useRef, useState } from 'react';
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import styles from './MainLayout.module.css';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function authorizedRequest(path, options = {}) {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('로그인이 필요합니다.');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');

    throw new Error(
      body && body.length < 160
        ? body
        : `요청 실패 (${response.status})`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

const notificationLabels = {
  TASK_ASSIGNMENT_REQUEST: ['👥', '담당 신청'],
  TASK_ASSIGNMENT_APPROVED: ['✅', '담당 신청 승인'],
  TASK_ASSIGNMENT_REJECTED: ['❌', '담당 신청 반려'],
};

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // 사용자 정보
  const [user, setUser] = useState(null);

  // 알림
  const [notifications, setNotifications] = useState([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const notificationRef = useRef(null);
  const requestSequence = useRef(0);

  // 사이드바 팀 목록
  const [teams, setTeams] = useState([]);
  const [teamsOpen, setTeamsOpen] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [teamsError, setTeamsError] = useState('');

  const teamRequestSequence = useRef(0);

  // 상단 메뉴
  const menuItems = [
    {
      path: '/dashboard',
      label: '대시보드',
      icon: '🏠',
      end: true,
    },
    {
      path: '/teams',
      label: '팀 관리',
      icon: '👥',
      end: true,
    },
  ];

  // 사용자 정보 조회
  useEffect(() => {
    let active = true;

    authorizedRequest('/api/users/me')
      .then((data) => {
        if (active) {
          setUser(data);
        }
      })
      .catch(() => { });

    return () => {
      active = false;
    };
  }, []);

  // 참여 팀 목록 조회
  const refreshTeams = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setTeams([]);
      setTeamsLoading(false);
      return;
    }

    const sequence = ++teamRequestSequence.current;

    setTeamsLoading(true);

    try {
      const data = await authorizedRequest('/api/teams');

      if (!Array.isArray(data)) {
        throw new Error('팀 목록 응답 형식이 올바르지 않습니다.');
      }

      if (sequence !== teamRequestSequence.current) {
        return;
      }

      // 팀 이름 가나다순 정렬
      const sortedTeams = [...data].sort((a, b) =>
        (a.name || '').localeCompare(
          b.name || '',
          'ko'
        )
      );

      setTeams(sortedTeams);
      setTeamsError('');
    } catch (error) {
      if (sequence === teamRequestSequence.current) {
        setTeamsError(
          error.message || '팀 목록을 불러오지 못했습니다.'
        );
      }
    } finally {
      if (sequence === teamRequestSequence.current) {
        setTeamsLoading(false);
      }
    }
  }, []);

  // 최초 진입 및 페이지 이동 시 팀 목록 갱신
  useEffect(() => {
    refreshTeams();
  }, [location.pathname, refreshTeams]);

  // 창에 다시 포커스하면 팀 목록 갱신
  useEffect(() => {
    const onFocus = () => {
      refreshTeams();
    };

    window.addEventListener('focus', onFocus);

    return () => {
      teamRequestSequence.current += 1;
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshTeams]);

  // 팀 생성/삭제 후 즉시 갱신할 때 사용할 이벤트
  useEffect(() => {
    const onTeamsChanged = () => {
      refreshTeams();
    };

    window.addEventListener('teamsChanged', onTeamsChanged);

    return () => {
      window.removeEventListener(
        'teamsChanged',
        onTeamsChanged
      );
    };
  }, [refreshTeams]);

  // 알림 조회
  const refreshNotifications = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setNotifications([]);
      return;
    }

    const sequence = ++requestSequence.current;

    setLoadingNotifications(true);

    try {
      const data = await authorizedRequest('/api/notifications');

      if (!Array.isArray(data)) {
        throw new Error(
          '알림 목록 응답 형식이 올바르지 않습니다.'
        );
      }

      if (sequence !== requestSequence.current) {
        return;
      }

      setNotifications(data);
      setNotificationError('');
    } catch (error) {
      if (sequence === requestSequence.current) {
        setNotificationError(
          error.message || '알림을 불러오지 못했습니다.'
        );
      }
    } finally {
      if (sequence === requestSequence.current) {
        setLoadingNotifications(false);
      }
    }
  }, []);

  // 알림 자동 갱신
  useEffect(() => {
    refreshNotifications();

    const interval = window.setInterval(
      refreshNotifications,
      30000
    );

    const onFocus = () => {
      refreshNotifications();
    };

    window.addEventListener('focus', onFocus);

    return () => {
      requestSequence.current += 1;

      window.clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [refreshNotifications]);

  // 알림 패널 외부 클릭 처리
  useEffect(() => {
    if (!notificationOpen) {
      return undefined;
    }

    const onOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', onOutside);

    return () => {
      document.removeEventListener('mousedown', onOutside);
    };
  }, [notificationOpen]);

  // 알림 삭제
  const handleDeleteNotification = async (notificationId) => {
    if (processingId !== null) {
      return;
    }

    setProcessingId(notificationId);
    setNotificationError('');

    requestSequence.current += 1;

    try {
      await authorizedRequest(
        `/api/notifications/${notificationId}`,
        {
          method: 'DELETE',
        }
      );

      setNotifications((previous) =>
        previous.filter(
          (item) => item.notificationId !== notificationId
        )
      );

      await refreshNotifications();
    } catch (error) {
      setNotificationError(
        error.message || '알림 삭제에 실패했습니다.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // 담당 신청 승인 / 거절
  const handleReview = async (item, action) => {
    if (processingId !== null) {
      return;
    }

    setProcessingId(item.notificationId);
    setNotificationError('');

    requestSequence.current += 1;

    try {
      await authorizedRequest(
        `/api/teams/${item.teamId}/tasks/assignments/${item.assignmentId}/${action}`,
        {
          method: 'PATCH',
        }
      );

      await refreshNotifications();
    } catch (error) {
      setNotificationError(
        error.message || '담당 신청 처리에 실패했습니다.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // 알림 날짜 표시
  const formatDate = (value) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 현재 선택한 팀 확인
  const isCurrentTeam = (teamId) => {
    const teamPath = `/teams/${teamId}`;

    return (
      location.pathname === teamPath ||
      location.pathname.startsWith(`${teamPath}/`)
    );
  };

  const displayName =
    user?.name || user?.loginId || '사용자';

  return (
    <div className={styles.layout}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <div className={styles.logo}>
          Team-Mate
        </div>

        <div className={styles.headerRight}>
          {/* 알림 */}
          <div
            ref={notificationRef}
            className={styles.notificationContainer}
          >
            <button
              type="button"
              className={styles.notificationButton}
              aria-label={`알림 ${notifications.length}건`}
              aria-expanded={notificationOpen}
              onClick={() => {
                setNotificationOpen((open) => !open);
                refreshNotifications();
              }}
            >
              🔔

              {notifications.length > 0 && (
                <span className={styles.notificationBadge}>
                  {notifications.length > 99
                    ? '99+'
                    : notifications.length}
                </span>
              )}
            </button>

            {notificationOpen && (
              <section
                role="region"
                aria-label="알림"
                className={styles.notificationPanel}
              >
                <div className={styles.notificationHeader}>
                  <strong className={styles.notificationTitle}>
                    알림 ({notifications.length})
                  </strong>

                  <button
                    type="button"
                    className={styles.notificationRefresh}
                    onClick={refreshNotifications}
                    disabled={loadingNotifications}
                  >
                    {loadingNotifications
                      ? '조회 중'
                      : '새로고침'}
                  </button>
                </div>

                {notificationError && (
                  <p
                    role="alert"
                    className={styles.notificationError}
                  >
                    {notificationError}
                  </p>
                )}

                {notifications.length === 0 &&
                  !notificationError && (
                    <p className={styles.notificationEmpty}>
                      새로운 알림이 없습니다.
                    </p>
                  )}

                {notifications.map((item) => {
                  const isRequest =
                    item.type === 'TASK_ASSIGNMENT_REQUEST';

                  const isProcessing =
                    processingId === item.notificationId;

                  const [icon, title] =
                    notificationLabels[item.type] ||
                    ['🔔', '알림'];

                  return (
                    <div
                      key={item.notificationId}
                      className={styles.notificationItem}
                    >
                      <div
                        className={styles.notificationItemHeader}
                      >
                        <strong
                          className={styles.notificationItemTitle}
                        >
                          {icon} {title}
                        </strong>

                        <span className={styles.notificationDate}>
                          {formatDate(item.createdAt)}
                        </span>
                      </div>

                      {isRequest ? (
                        <>
                          <p
                            className={styles.notificationMessage}
                          >
                            {item.message}
                          </p>

                          <div
                            className={styles.notificationActions}
                          >
                            <button
                              type="button"
                              className={styles.notificationAction}
                              disabled={processingId !== null}
                              onClick={() =>
                                handleReview(item, 'reject')
                              }
                            >
                              {isProcessing
                                ? '처리 중'
                                : '거절'}
                            </button>

                            <button
                              type="button"
                              className={`${styles.notificationAction} ${styles.notificationApprove}`}
                              disabled={processingId !== null}
                              onClick={() =>
                                handleReview(item, 'approve')
                              }
                            >
                              {isProcessing
                                ? '처리 중'
                                : '승인'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          className={styles.notificationRead}
                          disabled={processingId !== null}
                          onClick={() =>
                            handleDeleteNotification(
                              item.notificationId
                            )
                          }
                          title="클릭하면 알림이 삭제됩니다."
                        >
                          {item.message}

                          <span
                            className={styles.notificationReadHint}
                          >
                            {isProcessing
                              ? '삭제 중...'
                              : '클릭하여 확인'}
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </section>
            )}
          </div>

          {/* 프로필 */}
          <button
            type="button"
            className={styles.profile}
            onClick={() => navigate('/mypage')}
            title="마이페이지로 이동"
          >
            <div className={styles.avatar}>
              {displayName.charAt(0).toUpperCase()}
            </div>

            <span>{displayName}</span>
          </button>
        </div>
      </header>

      {/* 헤더 아래 영역 */}
      <div className={styles.body}>
        {/* 사이드바 */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            {/* 기본 메뉴 */}
            <nav
              className={styles.navigation}
              aria-label="기본 메뉴"
            >
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  title={item.label}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''
                    }`
                  }
                >
                  <span className={styles.navIcon}>
                    {item.icon}
                  </span>

                  <span className={styles.navLabel}>
                    {item.label}
                  </span>
                </NavLink>
              ))}
            </nav>

            {/* 내 팀 목록 */}
            <section className={styles.teamSection}>
              <button
                type="button"
                className={styles.teamSectionHeader}
                onClick={() =>
                  setTeamsOpen((previous) => !previous)
                }
                aria-expanded={teamsOpen}
                title="내 팀 목록 접기 또는 펼치기"
              >
                <span className={styles.teamSectionTitle}>
                  <span
                    className={`${styles.teamChevron} ${teamsOpen ? styles.teamChevronOpen : ''
                      }`}
                  >
                    ▶
                  </span>

                  <span>내 팀</span>
                </span>

                <span className={styles.teamCount}>
                  {teams.length}
                </span>
              </button>

              {teamsOpen && (
                <div className={styles.teamList}>
                  {teamsLoading && teams.length === 0 && (
                    <p className={styles.teamStatus}>
                      팀 목록 조회 중...
                    </p>
                  )}

                  {teamsError && (
                    <div className={styles.teamStatus}>
                      <p>{teamsError}</p>

                      <button
                        type="button"
                        className={styles.teamRetry}
                        onClick={refreshTeams}
                      >
                        다시 시도
                      </button>
                    </div>
                  )}

                  {!teamsLoading &&
                    !teamsError &&
                    teams.length === 0 && (
                      <p className={styles.teamStatus}>
                        참여 중인 팀이 없습니다.
                      </p>
                    )}

                  {teams.map((team) => (
                    <NavLink
                      key={team.teamId}
                      to={`/teams/${team.teamId}`}
                      title={team.name}
                      aria-current={
                        isCurrentTeam(team.teamId)
                          ? 'page'
                          : undefined
                      }
                      className={`${styles.teamItem} ${isCurrentTeam(team.teamId)
                          ? styles.teamItemActive
                          : ''
                        }`}
                    >
                      <span className={styles.teamIcon}>
                        📁
                      </span>

                      <span className={styles.teamName}>
                        {team.name}
                      </span>
                    </NavLink>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* 하단 마이페이지 */}
          <div className={styles.sidebarBottom}>
            <NavLink
              to="/mypage"
              title="마이페이지"
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''
                }`
              }
            >
              <span className={styles.navIcon}>
                ⚙️
              </span>

              <span className={styles.navLabel}>
                마이페이지
              </span>
            </NavLink>
          </div>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;