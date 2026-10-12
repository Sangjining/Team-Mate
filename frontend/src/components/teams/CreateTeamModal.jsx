import { useEffect, useState } from 'react';
import styles from './CreateTeamModal.module.css';

function CreateTeamModal({ isOpen, onClose, onCreate }) {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 모달이 열릴 때 입력값 초기화
  useEffect(() => {
    if (isOpen) {
      setTeamName('');
      setDescription('');
      setError('');
      setSubmitting(false);
    }
  }, [isOpen]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, submitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const name = teamName.trim();

    if (name.length < 2 || name.length > 30) {
      setError('팀 이름은 2~30자로 입력해주세요.');
      return;
    }

    if (description.trim().length > 200) {
      setError('팀 설명은 200자 이하로 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onCreate({ name, description: description.trim() });
      onClose();
    } catch (err) {
      setError(err.message || '팀 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          onClose();
        }
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-team-title"
      >
        <div className={styles.modalHeader}>
          <div>
            <h2 id="create-team-title">새 팀 만들기</h2>
            <p>새로운 협업 공간을 생성합니다.</p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="닫기"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="teamName">팀 이름 *</label>
            <input
              id="teamName"
              type="text"
              placeholder="팀 이름을 입력하세요"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                setError('');
              }}
              maxLength={30}
              autoFocus
            />
            <span className={styles.hint}>2~30자</span>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="teamDescription">팀 설명</label>
            <textarea
              id="teamDescription"
              placeholder="팀에 대한 간단한 설명을 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={4}
            />
            <span className={styles.hint}>
              {description.length}/200자
            </span>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={submitting}
            >
              취소
            </button>

            <button type="submit" className={styles.createButton} disabled={submitting}>
              {submitting ? '생성 중...' : '팀 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTeamModal;