import { useEffect, useState } from 'react';
import styles from './KanbanBoard.module.css';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailModal from './TaskDetailModal';

const KANBAN_COLUMNS = [
  { id: 'BACKLOG', title: '업무 대기', color: '#64748b' },
  { id: 'BLOCKED', title: '보류', color: '#ef4444' },
  { id: 'IN_PROGRESS', title: '진행 중', color: '#3b82f6' },
  { id: 'REVIEW', title: '검토 중', color: '#a855f7' },
  { id: 'TESTING', title: '테스트 중', color: '#f59e0b' },
  { id: 'DONE', title: '완료', color: '#22c55e' },
];

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
async function taskRequest(teamId, method, path = '', body) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('로그인이 필요합니다.');
  const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/tasks${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (!response.ok) throw new Error(data?.message || data?.error || `요청에 실패했습니다. (HTTP ${response.status})`);
  return data;
}
const toRequest = (form) => ({
  title: form.title.trim(),
  description: form.description?.trim() || '',
  assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
  dueDate: form.dueDate ? `${form.dueDate.split('T')[0]}T23:59:00` : null,
});

// 날짜 표시
function formatDate(date) {
    if (!date) return '마감일 없음';

    return date.split('T')[0];
}

function KanbanBoard({ teamId }) {
    // 업무 목록 상태
    const [tasks, setTasks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
      let active = true;
      setLoading(true);
      taskRequest(teamId, 'GET')
        .then((data) => { if (active) { setTasks(Array.isArray(data) ? data : []); setError(''); } })
        .catch((err) => { if (active) setError(err.message); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [teamId]);

    // 드래그 중인 업무 ID
    const [draggedTaskId, setDraggedTaskId] = useState(null);

    // 드래그 중인 카드가 올라간 열
    const [dragOverColumn, setDragOverColumn] = useState(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);

    // 드래그 시작
    const handleDragStart = (event, taskId) => {
        setDraggedTaskId(taskId);

        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(taskId));
    };

    // 드래그 중
    const handleDragOver = (event, columnId) => {
        event.preventDefault();

        event.dataTransfer.dropEffect = 'move';

        setDragOverColumn((prev) =>
            prev === columnId ? prev : columnId
        );
    };

    // 카드 놓기
    const handleDrop = async (event, columnId) => {
      event.preventDefault();
      const taskId = Number(event.dataTransfer.getData('text/plain'));
      setDraggedTaskId(null);
      setDragOverColumn(null);
      const task = tasks.find((item) => item.taskId === taskId);
      if (!task || task.status === columnId) return;
      try {
        const updated = await taskRequest(teamId, 'PATCH', `/${taskId}/status`, { status: columnId });
        setTasks((prev) => prev.map((item) => item.taskId === taskId ? updated : item));
        setError('');
      } catch (err) { setError(err.message); }
    };

    // 드래그 종료
    const handleDragEnd = () => {
        setDraggedTaskId(null);
        setDragOverColumn(null);
    };

    const handleCreateTask = async (form) => {
      const created = await taskRequest(teamId, 'POST', '', toRequest(form));
      setTasks((prev) => [...prev, created]);
      setIsCreateModalOpen(false);
      setError('');
    };

    const handleUpdateTask = async (form) => {
      const updated = await taskRequest(teamId, 'PATCH', `/${form.taskId}`, toRequest(form));
      // 상태 변경은 별도의 API입니다.
      const result = form.status !== updated.status
        ? await taskRequest(teamId, 'PATCH', `/${form.taskId}/status`, { status: form.status })
        : updated;
      setTasks((prev) => prev.map((item) => item.taskId === result.taskId ? result : item));
      setSelectedTaskId(null);
      setError('');
    };

    const handleDeleteTask = async (taskId) => {
      await taskRequest(teamId, 'DELETE', `/${taskId}`);
      setTasks((prev) => prev.filter((item) => item.taskId !== taskId));
      setSelectedTaskId(null);
      setError('');
    };

    const selectedTask = tasks.find((task) => task.taskId === selectedTaskId);

    return (
        <div className={styles.kanbanContainer}>

            {/* 상단 영역 */}
            <div className={styles.boardHeader}>
                <div>
                    <h2>업무 관리</h2>
                    <p>업무 카드를 드래그하여 진행 상태를 변경하세요.</p>
                </div>

                <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    + 업무 추가
                </button>
            </div>

            {error && <p role="alert" style={{ color: '#dc2626', padding: '8px 0' }}>{error}</p>}
            {loading && <p>업무 목록을 불러오는 중입니다...</p>}
            {/* 칸반 보드 */}
            <div className={styles.boardScroll}>
                <div className={styles.kanbanBoard}>

                    {KANBAN_COLUMNS.map((column) => {
                        const columnTasks = tasks.filter(
                            (task) => task.status === column.id
                        );

                        return (
                            <div
                                key={column.id}
                                className={`${styles.kanbanColumn} ${dragOverColumn === column.id
                                    ? styles.dragOverColumn
                                    : ''
                                    }`}
                                onDragOver={(event) =>
                                    handleDragOver(event, column.id)
                                }
                                onDrop={(event) =>
                                    handleDrop(event, column.id)
                                }
                                onDragLeave={(event) => {
                                    if (
                                        !event.currentTarget.contains(event.relatedTarget)
                                    ) {
                                        setDragOverColumn((prev) =>
                                            prev === column.id ? null : prev
                                        );
                                    }
                                }}
                            >

                                {/* 열 제목 */}
                                <div className={styles.columnHeader}>
                                    <div className={styles.columnTitle}>
                                        <span
                                            className={styles.statusDot}
                                            style={{
                                                backgroundColor: column.color,
                                            }}
                                        />

                                        <h3>{column.title}</h3>
                                    </div>

                                    <span className={styles.taskCount}>
                                        {columnTasks.length}
                                    </span>
                                </div>

                                {/* 업무 카드 목록 */}
                                <div className={styles.taskList}>

                                    {columnTasks.map((task) => (
                                        <div
                                            key={task.taskId}
                                            className={`${styles.taskCard} ${draggedTaskId === task.taskId
                                                ? styles.draggingCard
                                                : ''
                                                }`}
                                            draggable
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`${task.title} 업무 상세 보기`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setSelectedTaskId(task.taskId)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    setSelectedTaskId(task.taskId);
                                                }
                                            }}
                                            onDragStart={(event) =>
                                                handleDragStart(event, task.taskId)
                                            }
                                            onDragEnd={handleDragEnd}
                                        >

                                            <h4>{task.title}</h4>

                                            <p className={styles.taskDescription}>
                                                {task.description}
                                            </p>

                                            <div className={styles.taskFooter}>
                                                <div className={styles.assignee}>
                                                    <span className={styles.avatar}>
                                                        {task.assigneeName?.charAt(0) || '?'}
                                                    </span>

                                                    <span>
                                                        {task.assigneeName || '미배정'}
                                                    </span>
                                                </div>

                                                <span className={styles.dueDate}>
                                                    📅 {formatDate(task.dueDate)}
                                                </span>
                                            </div>

                                        </div>
                                    ))}

                                    {/* 빈 열 */}
                                    {columnTasks.length === 0 && (
                                        <div className={styles.emptyColumn}>
                                            등록된 업무가 없습니다.
                                        </div>
                                    )}

                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>

            {/* 업무 상세·수정·삭제 모달 */}
            {selectedTask && (
                <TaskDetailModal
                    key={selectedTask.taskId}
                    task={selectedTask}
                    onClose={() => setSelectedTaskId(null)}
                    onSave={handleUpdateTask}
                    onDelete={handleDeleteTask}
                />
            )}

            {/* 업무 추가 모달 */}
            {isCreateModalOpen && (
                <CreateTaskModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={handleCreateTask}
                />
            )}

        </div>
    );
}

export default KanbanBoard;