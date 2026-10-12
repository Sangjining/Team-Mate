import styles from './DashboardPage.module.css';

// 임시 업무 데이터
const mockTasks = [
  {
    taskId: 1,
    title: '로그인 페이지 구현',
    teamName: 'Team-Mate',
    status: 'IN_PROGRESS',
    dueDate: '2026-10-20',
  },
  {
    taskId: 2,
    title: '데이터베이스 설계',
    teamName: 'Team-Mate',
    status: 'DONE',
    dueDate: '2026-10-18',
  },
  {
    taskId: 3,
    title: '회원가입 API 연결',
    teamName: '웹 개발 팀',
    status: 'TODO',
    dueDate: '2026-10-25',
  },
];

// 임시 팀 데이터
const mockTeams = [
  {
    teamId: 1,
    name: 'Team-Mate',
    description: '웹 기반 협업 관리 플랫폼 개발',
    progress: 70,
  },
  {
    teamId: 2,
    name: '웹 개발 팀',
    description: '웹 서비스 프론트엔드 개발',
    progress: 45,
  },
  {
    teamId: 3,
    name: '앱 개발 팀',
    description: '모바일 애플리케이션 개발',
    progress: 20,
  },
];

// 업무 상태 표시
const statusMap = {
  TODO: {
    label: '대기',
    className: 'todo',
  },
  IN_PROGRESS: {
    label: '진행 중',
    className: 'inProgress',
  },
  DONE: {
    label: '완료',
    className: 'done',
  },
};

function DashboardPage() {
  const summaryCards = [
    { title: '참여 팀', value: 3, icon: '👥' },
    { title: '진행 중 업무', value: 5, icon: '📋' },
    { title: '완료 업무', value: 12, icon: '✅' },
    { title: '예정 일정', value: 2, icon: '📅' },
  ];

  return (
    <div className={styles.dashboard}>
      {/* 페이지 제목 */}
      <div className={styles.pageHeader}>
        <h1>대시보드</h1>
        <p>Team-Mate에 오신 것을 환영합니다.</p>
      </div>

      {/* 요약 카드 */}
      <section className={styles.summaryGrid}>
        {summaryCards.map((card) => (
          <div key={card.title} className={styles.summaryCard}>
            <div className={styles.summaryInfo}>
              <span className={styles.summaryTitle}>
                {card.title}
              </span>

              <strong className={styles.summaryValue}>
                {card.value}
              </strong>
            </div>

            <div className={styles.summaryIcon}>
              {card.icon}
            </div>
          </div>
        ))}
      </section>

      {/* 최근 업무 + 내 팀 */}
      <div className={styles.contentGrid}>

        {/* 최근 업무 */}
        <section className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h2>최근 업무</h2>
            <span className={styles.moreText}>전체 보기</span>
          </div>

          <div className={styles.taskList}>
            {mockTasks.map((task) => {
              const status = statusMap[task.status];

              return (
                <div key={task.taskId} className={styles.taskItem}>
                  <div className={styles.taskInfo}>
                    <strong>{task.title}</strong>

                    <span>
                      {task.teamName} · {task.dueDate}
                    </span>
                  </div>

                  <span
                    className={`${styles.statusBadge} ${
                      styles[status.className]
                    }`}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 내 팀 */}
        <section className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h2>내 팀</h2>
            <span className={styles.moreText}>전체 보기</span>
          </div>

          <div className={styles.teamList}>
            {mockTeams.map((team) => (
              <div key={team.teamId} className={styles.teamItem}>
                <div className={styles.teamInfo}>
                  <strong>{team.name}</strong>
                  <span>{team.description}</span>
                </div>

                <div className={styles.progressHeader}>
                  <span>진행률</span>
                  <strong>{team.progress}%</strong>
                </div>

                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${team.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default DashboardPage;