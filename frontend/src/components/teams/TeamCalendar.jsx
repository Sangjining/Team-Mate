import { useCallback, useEffect, useMemo, useState } from 'react';
import ScheduleModal from './ScheduleModal';
import styles from './TeamCalendar.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

async function request(teamId, method = 'GET', scheduleId, body, signal) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('로그인이 필요합니다.');
  const url = `${API_BASE_URL}/api/teams/${teamId}/schedules${scheduleId == null ? '' : `/${scheduleId}`}`;
  const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), signal });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (!response.ok) throw new Error(data?.message || data?.error || `일정 요청에 실패했습니다. (HTTP ${response.status})`);
  return data;
}

export default function TeamCalendar({ teamId, members, onOpenTasks }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [schedules, setSchedules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async (signal) => {
    setLoading(true); setError('');
    try {
      const token = localStorage.getItem('token');
      const [items, taskResponse, userResponse] = await Promise.all([
        // 1. 일정 목록
        request(teamId, 'GET', null, null, signal),

        // 2. 업무 목록
        fetch(`${API_BASE_URL}/api/teams/${teamId}/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        }),

        // 3. 현재 사용자 정보
        fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal,
        }),
      ]);
      if (!taskResponse.ok) throw new Error('업무 마감일 정보를 불러오지 못했습니다.');
      if (!userResponse.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
      const taskItems = await taskResponse.json();
      const user = await userResponse.json();
      if (signal?.aborted) return;
      setSchedules(Array.isArray(items) ? items : []);
      setTasks(Array.isArray(taskItems) ? taskItems : []);
      setCurrentUser(user);
    } catch (err) { if (!signal?.aborted) setError(err.message); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [teamId]);

  useEffect(() => { const controller = new AbortController(); load(controller.signal); return () => controller.abort(); }, [load]);

  const isOwner = members?.some((member) => String(member.userId) === String(currentUser?.userId) && member.role === 'OWNER');
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
  }, [month]);
  const itemsByDay = useMemo(() => {
    const map = new Map();
    for (const day of days) {
      const key = dateKey(day);
      const items = schedules.filter((item) => {
        if (!item.startAt) return false;
        const start = String(item.startAt).slice(0, 10);
        const end = String(item.endAt || item.startAt).slice(0, 10);
        return start <= key && key <= end;
      }).sort((a, b) => String(a.startAt).localeCompare(String(b.startAt)));
      map.set(key, items);
    }
    return map;
  }, [days, schedules]);

  const deadlinesByDay = useMemo(() => {
    const map = new Map();
    for (const task of tasks) {
      if (!task.dueDate || task.status === 'DONE') continue;
      const key = String(task.dueDate).slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(task);
    }
    return map;
  }, [tasks]);

  async function handleSave(payload, scheduleId) {
    const saved = await request(teamId, scheduleId == null ? 'POST' : 'PATCH', scheduleId, payload);
    setSchedules((previous) => scheduleId == null ? [...previous, saved] : previous.map((item) => String(item.scheduleId) === String(scheduleId) ? saved : item));
    setNotice(scheduleId == null ? '일정이 등록되었습니다.' : '일정이 수정되었습니다.');
  }
  async function handleDelete(scheduleId) {
    await request(teamId, 'DELETE', scheduleId);
    setSchedules((previous) => previous.filter((item) => String(item.scheduleId) !== String(scheduleId)));
    setNotice('일정이 삭제되었습니다.');
  }
  const changeMonth = (offset) => setMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + offset, 1));
  const today = dateKey(new Date());

  return (
    <section className={styles.calendar}>
      <div className={styles.header}><div><h2>일정 관리</h2><p>팀의 일정을 달력에서 확인하고 관리합니다.</p></div><button className={styles.addButton} type="button" onClick={() => setModal({ initialDate: today })}>+ 일정 추가</button></div>
      {error && <p className={styles.error} role="alert">{error} <button type="button" onClick={() => load()}>다시 시도</button></p>}
      {notice && <p className={styles.notice} role="status">{notice}</p>}
      <div className={styles.legend}><span><i className={styles.scheduleDot} /> 팀 일정</span><span><i className={styles.deadlineDot} /> 업무 마감일 (미완료)</span></div>
      <div className={styles.toolbar}><button type="button" onClick={() => changeMonth(-1)} aria-label="이전 달">‹</button><h3>{month.getFullYear()}년 {month.getMonth() + 1}월</h3><button type="button" onClick={() => changeMonth(1)} aria-label="다음 달">›</button><button type="button" className={styles.todayButton} onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>오늘</button></div>
      {loading ? <p className={styles.message}>일정을 불러오는 중입니다...</p> : (
        <div className={styles.grid}>
          {WEEKDAYS.map((name) => <div key={name} className={styles.weekday}>{name}</div>)}
          {days.map((day) => {
            const key = dateKey(day);
            const entries = itemsByDay.get(key) || [];
            const deadlineEntries = deadlinesByDay.get(key) || [];
            const allCount = entries.length + deadlineEntries.length;
            const visibleSchedules = entries.slice(0, 3);
            const visibleDeadlines = deadlineEntries.slice(0, Math.max(0, 3 - visibleSchedules.length));
            return <div key={key} className={`${styles.day} ${day.getMonth() !== month.getMonth() ? styles.outside : ''} ${key === today ? styles.today : ''}`}>
              <button type="button" className={styles.dayNumber} onClick={() => setModal({ initialDate: key })} title={`${key} 일정 추가`}>{day.getDate()}</button>
              <div className={styles.events}>
                {visibleSchedules.map((item) => <button key={`schedule-${item.scheduleId}`} type="button" className={styles.event} title={item.title} onClick={() => setModal({ schedule: item })}>{item.title}</button>)}
                {visibleDeadlines.map((task) => <button key={`task-${task.taskId}`} type="button" className={styles.deadlineEvent} title={`업무 마감일: ${task.title}${task.assigneeName ? ` · 담당: ${task.assigneeName}` : ''}`} onClick={() => onOpenTasks?.()}>마감 · {task.title}</button>)}
                {allCount > 3 && <span className={styles.more}>+{allCount - 3}개 더</span>}
              </div>
            </div>;
          })}
        </div>
      )}
      {modal && <ScheduleModal key={modal.schedule?.scheduleId ?? `new-${modal.initialDate}`} schedule={modal.schedule} initialDate={modal.initialDate || today} canManage={isOwner || String(modal.schedule?.createdById) === String(currentUser?.userId)} onClose={() => setModal(null)} onSave={handleSave} onDelete={handleDelete} />}
    </section>
  );
}
