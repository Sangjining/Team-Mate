import { useState } from 'react';
import styles from './CreateTaskModal.module.css';

const STATUS_OPTIONS = [
  { value: 'BACKLOG', label: '업무 대기' },
  { value: 'BLOCKED', label: '보류' },
  { value: 'IN_PROGRESS', label: '진행 중' },
  { value: 'REVIEW', label: '검토 중' },
  { value: 'TESTING', label: '테스트 중' },
  { value: 'DONE', label: '완료' },
];

function CreateTaskModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    assigneeId: '',
    dueDate: '',
    status: 'BACKLOG',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      alert('업무 제목을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onCreate({
      title: form.title.trim(),
      description: form.description.trim(),
      assigneeId: form.assigneeId,
      dueDate: form.dueDate,
      status: form.status,
    });
    } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
      >
        <div className={styles.header}>
          <h2 id="create-task-title">새 업무 추가</h2>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="task-title">
              업무 제목 <span>*</span>
            </label>

            <input
              id="task-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="업무 제목을 입력하세요"
              maxLength={100}
              required
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="task-description">업무 설명</label>

            <textarea
              id="task-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="업무 내용을 입력하세요"
              rows={4}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="task-assignee">담당자</label>

            <input
              id="task-assignee" type="number" min="1"
              name="assigneeId"
              value={form.assigneeId}
              onChange={handleChange}
              placeholder="팀원 사용자 ID (선택)"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="task-due-date">마감일</label>

            <input
              id="task-due-date"
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="task-status">진행 상태</label>

            <select
              id="task-status"
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              취소
            </button>

            <button type="submit" disabled={submitting} className={styles.submitButton}>
              업무 등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;