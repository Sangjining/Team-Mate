import { useEffect, useState } from 'react';
import styles from './TaskDetailModal.module.css';

const STATUS_OPTIONS = [
  { value: 'BACKLOG', label: '업무 대기' },
  { value: 'BLOCKED', label: '보류' },
  { value: 'IN_PROGRESS', label: '진행 중' },
  { value: 'REVIEW', label: '검토 중' },
  { value: 'TESTING', label: '테스트 중' },
  { value: 'DONE', label: '완료' },
];

export default function TaskDetailModal({ task, onClose, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: task.title ?? '',
    description: task.description ?? '',
    assigneeId: task.assigneeId ?? '',
    dueDate: task.dueDate?.split('T')[0] ?? '',
    status: task.status ?? 'BACKLOG',
  });

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      alert('업무 제목을 입력해주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try { await onSave({
      taskId: task.taskId,
      title: form.title.trim(),
      description: form.description.trim(),
      assigneeId: form.assigneeId,
      dueDate: form.dueDate,
      status: form.status,
    }); } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (window.confirm(`'${task.title}' 업무를 삭제하시겠습니까?`)) {
      setSubmitting(true);
      setError('');
      try { await onDelete(task.taskId); } catch (err) { setError(err.message); } finally { setSubmitting(false); }
    }
  };

  const statusLabel = STATUS_OPTIONS.find((option) => option.value === task.status)?.label ?? task.status;

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
        {isEditing ? (
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
              <input id="edit-task-assignee" type="number" min="1" name="assigneeId" value={form.assigneeId} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label htmlFor="edit-task-due-date">마감일</label>
              <input id="edit-task-due-date" type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label htmlFor="edit-task-status">진행 상태</label>
              <select id="edit-task-status" name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setIsEditing(false)}>취소</button>
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
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.deleteButton} onClick={handleDelete}>업무 삭제</button>
              <button type="button" className={styles.primaryButton} onClick={() => setIsEditing(true)}>업무 수정</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
