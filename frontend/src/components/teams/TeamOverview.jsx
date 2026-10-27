import { useEffect, useMemo, useState } from 'react';
import styles from './TeamOverview.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const STATUSES = [
  { key: 'BACKLOG', label: '업무 대기' },
  { key: 'BLOCKED', label: '진행 차단' },
  { key: 'IN_PROGRESS', label: '진행 중' },
  { key: 'REVIEW', label: '검토' },
  { key: 'TESTING', label: '테스트' },
  { key: 'DONE', label: '완료' },
];

async function getData(teamId, endpoint, signal) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
  const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/tasks${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  const raw = await response.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { /* non-JSON error */ }
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `업무 정보를 불러오지 못했습니다. (HTTP ${response.status})`);
  }
  return data;
}

function getDayDifference(dueDate) {
  // LocalDateTime is returned without a timezone; compare local calendar dates.
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const dueUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((dueUtc - todayUtc) / 86400000);
}

function deadlineLabel(days) {
  if (days < 0) return `${Math.abs(days)}일 지남`;
  if (days === 0) return '오늘 마감';
  if (days === 1) return '내일 마감';
  return `D-${days}`;
}

function TeamOverview({ teamId, memberCount, onOpenTasks }) {
  const [tasks, setTasks] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [taskResult, progressResult] = await Promise.all([
          getData(teamId, '', controller.signal),
          getData(teamId, '/progress', controller.signal),
        ]);
        if (controller.signal.aborted) return;
        if (!Array.isArray(taskResult)) throw new Error('업무 목록 응답 형식이 올바르지 않습니다.');
        setTasks(taskResult);
        setProgressData(progressResult);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [teamId]);

  const counts = useMemo(() => Object.fromEntries(
    STATUSES.map(({ key }) => [key, tasks.filter((task) => task.status === key).length])
  ), [tasks]);

  const pendingTasks = useMemo(() => tasks
    .filter((task) => task.status === 'BACKLOG')
    .sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    })
    .slice(0, 5), [tasks]);

  const deadlines = useMemo(() => tasks
    .filter((task) => task.status !== 'DONE' && task.dueDate)
    .map((task) => ({ ...task, daysLeft: getDayDifference(task.dueDate) }))
    .filter((task) => task.daysLeft !== null && task.daysLeft <= 3)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5), [tasks]);

  if (loading) return <div className={styles.state}>팀 개요를 불러오는 중입니다...</div>;
  if (error) return <div className={styles.state} role="alert">{error}</div>;

  const total = progressData?.totalTasks ?? tasks.length;
  const completed = progressData?.completedTasks ?? counts.DONE;
  const progress = Math.max(0, Math.min(100,
    Number(progressData?.progress ?? (total ? Math.round(completed / total * 100) : 0)) || 0
  ));

  return (
    <section className={styles.overview}>
      <div className={styles.heading}>
        <h2>팀 개요</h2>
        <p>대기 중인 업무와 프로젝트 진행 상황, 다가오는 마감일을 확인합니다.</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}><span>전체 업무</span><strong>{total}<small>개</small></strong></div>
        <div className={`${styles.statCard} ${styles.pendingStat}`}><span>업무 대기</span><strong>{counts.BACKLOG}<small>개</small></strong></div>
        <div className={styles.statCard}><span>완료 업무</span><strong>{completed}<small>개</small></strong></div>
        <div className={styles.statCard}><span>팀원 수</span><strong>{memberCount}<small>명</small></strong></div>
      </div>

      <div className={`${styles.panel} ${styles.pendingPanel}`}>
        <div className={styles.panelTitle}>
          <h3>📌 대기 중인 업무 <span className={styles.pendingCount}>{counts.BACKLOG}개</span></h3>
          <span className={styles.subtext}>최대 5개 표시</span>
        </div>
        {pendingTasks.length === 0 ? (
          <p className={styles.empty}>현재 대기 중인 업무가 없습니다.</p>
        ) : (
          <div className={styles.deadlineList}>
            {pendingTasks.map((task) => {
              const days = task.dueDate ? getDayDifference(task.dueDate) : null;
              return (
                <div className={styles.deadlineItem} key={task.taskId}>
                  <div className={styles.deadlineInfo}>
                    <span className={styles.deadlineTitle}>{task.title}</span>
                    {task.assigneeName && <small>담당: {task.assigneeName}</small>}
                  </div>
                  <span className={`${styles.deadlineBadge} ${days !== null && days <= 0 ? styles.urgent : days === 1 ? styles.soon : styles.pendingBadge}`}>
                    {days === null ? '마감일 없음' : days <= 3 ? deadlineLabel(days) : `D-${days}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <button type="button" className={styles.viewTasks} onClick={onOpenTasks}>대기 업무 확인하기 →</button>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTitle}><h3>전체 진행률</h3><strong>{progress}%</strong></div>
        <div className={styles.progressTrack} role="progressbar" aria-label="전체 진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <p className={styles.subtext}>전체 {total}개 업무 중 {completed}개 완료</p>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTitle}><h3>업무 상태별 현황</h3></div>
        <div className={styles.statusGrid}>
          {STATUSES.map(({ key, label }) => (
            <div className={styles.statusItem} key={key}>
              <div className={styles.statusLine}><span>{label}</span><strong>{counts[key]}개</strong></div>
              <div className={styles.statusTrack}>
                <div className={styles.statusFill} style={{ width: `${tasks.length ? counts[key] / tasks.length * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelTitle}><h3>🔔 마감기한 임박 업무</h3><span className={styles.subtext}>최대 5개</span></div>
        {deadlines.length === 0 ? (
          <p className={styles.empty}>3일 이내 마감되거나 기한이 지난 미완료 업무가 없습니다.</p>
        ) : (
          <div className={styles.deadlineList}>
            {deadlines.map((task) => (
              <div className={styles.deadlineItem} key={task.taskId}>
                <div className={styles.deadlineInfo}>
                  <span className={styles.deadlineTitle}>{task.title}</span>
                  {task.assigneeName && <small>담당: {task.assigneeName}</small>}
                </div>
                <span className={`${styles.deadlineBadge} ${task.daysLeft <= 0 ? styles.urgent : task.daysLeft === 1 ? styles.soon : styles.upcoming}`}>
                  {deadlineLabel(task.daysLeft)}
                </span>
              </div>
            ))}
          </div>
        )}
        <button type="button" className={styles.viewTasks} onClick={onOpenTasks}>업무 관리에서 확인 →</button>
      </div>
    </section>
  );
}

export default TeamOverview;
