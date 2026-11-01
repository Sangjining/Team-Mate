import { useEffect, useState } from 'react';
import styles from './TaskDetailModal.module.css';

const STATUS_OPTIONS = [
  { value: 'BACKLOG', label: '업무 대기' },
  { value: 'TODO', label: '할 일' },
  { value: 'BLOCKED', label: '보류' },
  { value: 'IN_PROGRESS', label: '진행 중' },
  { value: 'REVIEW', label: '검토 중' },
  { value: 'TESTING', label: '테스트 중' },
  { value: 'DONE', label: '완료' },
];
const PRIORITY_OPTIONS = [
  { value: 'HIGH', label: '높음' },
  { value: 'MEDIUM', label: '보통' },
  { value: 'LOW', label: '낮음' },
];

export default function TaskDetailModal({
  task, onClose, onSave, onDelete, members = [], isOwner = false, canManage,
}) {
  // isOwner는 기존 KanbanBoard에서 관리 권한(OWNER 또는 생성자)을 전달하는 값입니다.
  const mayManage = canManage ?? isOwner;
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: task.title ?? '',
    description: task.description ?? '',
    assigneeId: task.assigneeId == null ? '' : String(task.assigneeId),
    dueDate: task.dueDate?.split('T')[0] ?? '',
    status: task.status ?? 'BACKLOG',
    priority: task.priority ?? 'MEDIUM',
  });

  useEffect(() => {
    const onKeyDown = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const runAction = async (action) => {
    setSubmitting(true);
    setError('');
    try { await action(); } catch (err) { setError(err?.message || '요청 처리에 실패했습니다.'); }
    finally { setSubmitting(false); }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!mayManage) { setError('이 업무를 수정할 권한이 없습니다.'); return; }
    if (!form.title.trim()) { setError('업무 제목을 입력해주세요.'); return; }
    await runAction(() => onSave({
      taskId: task.taskId,
      title: form.title.trim(),
      description: form.description.trim(),
      // MEMBER가 기존 담당자를 덮어쓰지 않도록 현재 값을 유지합니다.
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate,
      status: form.status,
      priority: form.priority,
    }));
  };

  const handleDelete = async () => {
    if (!mayManage) { setError('이 업무를 삭제할 권한이 없습니다.'); return; }
    if (window.confirm(`'${task.title}' 업무를 삭제하시겠습니까?`)) {
      await runAction(() => onDelete(task.taskId));
    }
  };

  const statusLabel = STATUS_OPTIONS.find((o) => o.value === task.status)?.label ?? task.status;
  const priorityLabel = PRIORITY_OPTIONS.find((o) => o.value === task.priority)?.label ?? '보통';

  return (
    <div className={styles.overlay} onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="task-detail-title">
        <div className={styles.header}>
          <h2 id="task-detail-title">{isEditing ? '업무 수정' : '업무 상세'}</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="닫기">✕</button>
        </div>
        {error && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}
        {isEditing && mayManage ? (
          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="edit-task-title">업무 제목 *</label>
              <input id="edit-task-title" name="title" value={form.title} onChange={handleChange} required maxLength={100} autoFocus />
            </div>
            <div className={styles.field}>
              <label htmlFor="edit-task-description">업무 설명</label>
              <textarea id="edit-task-description" name="description" value={form.description} onChange={handleChange} rows={4} />
            </div>
            <div className={styles.field}>
              <label htmlFor="edit-task-assignee">담당자</label>
              {mayManage ? (
                <select id="edit-task-assignee" name="assigneeId" value={form.assigneeId} onChange={handleChange}>
                  <option value="">담당자 미지정</option>
                  {members.map((member) => {
                    const user = member.user ?? member;
                    const id = member.userId ?? user.userId;
                    const name = member.name ?? user.name ?? member.userName ?? `사용자 ${id}`;
                    return <option key={id} value={id}>{name}{member.role ? ` (${member.role})` : ''}</option>;
                  })}
                  {form.assigneeId && !members.some((member) => String(member.userId ?? member.user?.userId) === form.assigneeId) && (
                    <option value={form.assigneeId}>{task.assigneeName || `사용자 ${form.assigneeId}`} (현재 담당자)</option>
                  )}
                </select>
              ) : (
                <input id="edit-task-assignee" type="text" value={task.assigneeName || '담당자 미지정'} readOnly aria-readonly="true" />
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor="edit-task-due-date">마감일</label>
              <input id="edit-task-due-date" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label htmlFor="edit-task-status">진행 상태</label>
              <select id="edit-task-status" name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="edit-task-priority">우선순위</label>
              <select id="edit-task-priority" name="priority" value={form.priority} onChange={handleChange}>
                {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsEditing(false)} disabled={submitting}>취소</button>
              <button type="submit" disabled={submitting} className={styles.primaryButton}>변경 사항 저장</button>
            </div>
          </form>
        ) : (
          <>
            <div className={styles.details}>
              <div><strong>업무 제목</strong><p>{task.title}</p></div>
              <div><strong>업무 설명</strong><p>{task.description || '설명 없음'}</p></div>
              <div><strong>담당자</strong><p>{task.assigneeName || '미배정'}</p></div>
              <div><strong>마감일</strong><p>{task.dueDate?.split('T')[0] || '설정 안 됨'}</p></div>
              <div><strong>진행 상태</strong><p>{statusLabel}</p></div>
              <div><strong>우선순위</strong><p>{priorityLabel}</p></div>
            </div>
            <div className={styles.actions}>
              {mayManage ? (
                <>
                  <button type="button" className={styles.deleteButton} disabled={submitting} onClick={handleDelete}>업무 삭제</button>
                  <button type="button" className={styles.primaryButton} disabled={submitting} onClick={() => setIsEditing(true)}>업무 수정</button>
                </>
              ) : (
                <button type="button" className={styles.secondaryButton} onClick={onClose}>닫기</button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
