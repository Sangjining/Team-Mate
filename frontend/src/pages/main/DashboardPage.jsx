import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './DashboardPage.module.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const statusInfo = {
  BACKLOG: ['업무 대기', 'neutral'], TODO: ['할 일', 'neutral'],
  BLOCKED: ['보류', 'warning'], IN_PROGRESS: ['진행 중', 'blue'],
  REVIEW: ['검토', 'purple'], TESTING: ['테스트', 'purple'], DONE: ['완료', 'green'],
};
const formatDate = (date) => date ? String(date).slice(0, 10) : '기한 없음';
const validTime = (value) => { const t = new Date(value).getTime(); return Number.isFinite(t) ? t : Infinity; };

export default function DashboardPage() {
  const [data, setData] = useState({ teams: [], tasks: [], schedules: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    async function load() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('로그인이 필요합니다.');
        const get = async (path) => {
          const response = await fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${token}` }, signal });
          if (!response.ok) throw new Error(`${path} 조회 실패 (HTTP ${response.status})`);
          return response.json();
        };
        const teams = await get('/api/teams');
        if (!Array.isArray(teams)) throw new Error('팀 목록 응답 형식이 올바르지 않습니다.');
        const results = await Promise.all(teams.map(async (team) => {
          const endpoints = ['tasks', 'schedules', 'tasks/progress'];
          const settled = await Promise.allSettled(endpoints.map((endpoint) => get(`/api/teams/${team.teamId}/${endpoint}`)));
          return { team, settled };
        }));
        const allTasks = [], allSchedules = [], allTeams = [], failures = [];
        results.forEach(({ team, settled }) => {
          const [taskResult, scheduleResult, progressResult] = settled;
          if (taskResult.status === 'fulfilled' && Array.isArray(taskResult.value)) {
            allTasks.push(...taskResult.value.map((task) => ({ ...task, teamId: team.teamId, teamName: team.name })));
          } else failures.push(`${team.name}: 업무 조회 실패`);
          if (scheduleResult.status === 'fulfilled' && Array.isArray(scheduleResult.value)) {
            allSchedules.push(...scheduleResult.value.map((schedule) => ({ ...schedule, teamId: team.teamId, teamName: team.name })));
          } else failures.push(`${team.name}: 일정 조회 실패`);
          const progress = progressResult.status === 'fulfilled' ? Number(progressResult.value?.progress) : NaN;
          if (progressResult.status !== 'fulfilled') failures.push(`${team.name}: 진행률 조회 실패`);
          allTeams.push({ ...team, progress: Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : null });
        });
        if (!signal.aborted) {
          setData({ teams: allTeams, tasks: allTasks, schedules: allSchedules });
          setWarnings(failures);
        }
      } catch (err) {
        if (!signal.aborted) setError(err.message || '데이터를 불러오지 못했습니다.');
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  const now = Date.now();
  const ongoing = data.tasks.filter((task) => task.status !== 'DONE' && task.status !== 'BACKLOG' && task.status !== 'TODO').length;
  const completed = data.tasks.filter((task) => task.status === 'DONE').length;
  const upcoming = data.schedules.filter((schedule) => validTime(schedule.endAt || schedule.startAt) >= now);
  const recentTasks = [...data.tasks].sort((a, b) => validTime(b.updatedAt || b.createdAt) - validTime(a.updatedAt || a.createdAt)).slice(0, 5);
  const nextSchedules = [...upcoming].sort((a, b) => validTime(a.startAt) - validTime(b.startAt)).slice(0, 5);
  const cards = [
    { title: '참여 팀', value: data.teams.length, icon: '👥' },
    { title: '진행 중 업무', value: ongoing, icon: '📋' },
    { title: '완료 업무', value: completed, icon: '✅' },
    { title: '예정 일정', value: upcoming.length, icon: '📅' },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <div><span className={styles.eyebrow}>WORKSPACE OVERVIEW</span><h1>대시보드</h1><p>참여 중인 모든 팀의 진행 상황을 한눈에 확인하세요.</p></div>
        <Link className={styles.primaryButton} to="/teams">내 팀 관리 →</Link>
      </div>
      {loading && <div className={styles.notice}>대시보드 데이터를 불러오는 중입니다...</div>}
      {error && <div className={styles.error} role="alert">{error}</div>}
      {!loading && !error && <>
        {warnings.length > 0 && <div className={styles.notice} role="status">일부 데이터를 불러오지 못했습니다. ({warnings.join(', ')}) 아래 통계는 조회된 데이터만 반영합니다.</div>}
        <section className={styles.summaryGrid} aria-label="전체 현황">
          {cards.map((card) => <div className={styles.summaryCard} key={card.title}><div className={styles.summaryInfo}><span className={styles.summaryTitle}>{card.title}</span><strong className={styles.summaryValue}>{card.value}</strong></div><span className={styles.summaryIcon}>{card.icon}</span></div>)}
        </section>
        <div className={styles.contentGrid}>
          <section className={styles.contentCard}>
            <div className={styles.cardHeader}><div><span className={styles.sectionLabel}>TASKS</span><h2>최근 업무</h2></div><Link className={styles.moreText} to="/teams">팀에서 보기 →</Link></div>
            {recentTasks.length === 0 ? <p className={styles.empty}>등록된 업무가 없습니다. 팀에서 첫 업무를 만들어보세요.</p> : <div className={styles.taskList}>{recentTasks.map((task) => {
              const [label, tone] = statusInfo[task.status] || [task.status || '미정', 'neutral'];
              return <Link to={`/teams/${task.teamId}`} className={styles.taskItem} key={`${task.teamId}-${task.taskId}`}><div className={styles.taskInfo}>
                <strong>{task.title}</strong>

                <div className={styles.taskMeta}>
                  <span className={styles.teamBadge}>
                    👥 {task.teamName}
                  </span>

                  <span className={styles.taskDueDate}>
                    {task.dueDate
                      ? `마감 ${formatDate(task.dueDate)}`
                      : '기한 없음'}
                  </span>
                </div>
              </div><span className={`${styles.statusBadge} ${styles[tone]}`}>{label}</span></Link>;
            })}</div>}
          </section>
          <section className={styles.contentCard}>
            <div className={styles.cardHeader}><div><span className={styles.sectionLabel}>MY TEAMS</span><h2>내 팀 현황</h2></div><Link className={styles.moreText} to="/teams">전체 보기 →</Link></div>
            {data.teams.length === 0 ? <div className={styles.empty}>참여 중인 팀이 없습니다.<br /><Link to="/teams">팀 만들러 가기 →</Link></div> : <div className={styles.teamList}>{data.teams.slice(0, 5).map((team) => <Link className={styles.teamItem} key={team.teamId} to={`/teams/${team.teamId}`}><div className={styles.teamInfo}><strong>{team.name}</strong><span>{team.description || '팀 설명이 없습니다.'}</span></div><div className={styles.progressHeader}><span>업무 진행률</span><strong>{team.progress === null ? '조회 실패' : `${Math.round(team.progress)}%`}</strong></div><div className={styles.progressTrack}><div className={styles.progressBar} style={{ width: `${team.progress ?? 0}%` }} /></div></Link>)}</div>}
          </section>
        </div>
        <section className={`${styles.contentCard} ${styles.scheduleCard}`}>
          <div className={styles.cardHeader}><div><span className={styles.sectionLabel}>UPCOMING</span><h2>다가오는 일정</h2></div><Link className={styles.moreText} to="/teams">팀 일정 보기 →</Link></div>
          {nextSchedules.length === 0 ? <p className={styles.empty}>예정된 일정이 없습니다.</p> : <div className={styles.scheduleList}>{nextSchedules.map((schedule) => <Link key={`${schedule.teamId}-${schedule.scheduleId}`} className={styles.scheduleItem} to={`/teams/${schedule.teamId}`}><span className={styles.datePill}>{formatDate(schedule.startAt)}</span><div className={styles.scheduleInfo}><strong>{schedule.title}</strong><span>{schedule.teamName}</span></div><span className={styles.scheduleArrow}>→</span></Link>)}</div>}
        </section>
      </>}
    </div>
  );
}
