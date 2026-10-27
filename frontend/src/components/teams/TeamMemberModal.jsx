import { useEffect, useState } from 'react';
import styles from './TeamMemberModal.module.css';

function TeamMemberModal({ member, isOwner, isCreator, creatorKnown, isSelf, submitting, onClose, onChangeRole, onRemove }) {
  const [error, setError] = useState('');

  useEffect(() => { setError(''); }, [member?.userId]);

  useEffect(() => {
    if (!member) return;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [member, submitting, onClose]);

  if (!member) return null;

  const canPromote = isOwner && member.role === 'MEMBER' && !isSelf;
  const canDemote = isOwner && member.role === 'OWNER' && !isCreator && !isSelf && creatorKnown;
  const canRemove = isOwner && member.role === 'MEMBER' && !isSelf;
  const canChangeRole = canPromote || canDemote;
  const nextRole = member.role === 'OWNER' ? 'MEMBER' : 'OWNER';

  const runAction = async (action) => {
    setError('');
    try { await action(); } catch (err) { setError(err.message || '요청에 실패했습니다.'); }
  };

  return (
    <div className={styles.overlay} onMouseDown={(event) => {
      if (event.target === event.currentTarget && !submitting) onClose();
    }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="member-modal-title">
        <div className={styles.modalHeader}>
          <div>
            <h2 id="member-modal-title">팀원 관리</h2>
            <p>팀원의 정보와 권한을 확인합니다.</p>
          </div>
          <button className={styles.closeButton} type="button" onClick={onClose} disabled={submitting} aria-label="닫기">×</button>
        </div>

        <div className={styles.profile}>
          <div className={styles.avatar}>{member.name?.charAt(0) || '?'}</div>
          <strong>{member.name}</strong>
          <span className={styles.loginId}>@{member.loginId}</span>
          {isCreator && <span className={styles.creatorLabel}>👑 최초 생성자</span>}
        </div>

        <div className={styles.roleRow}>
          <span>현재 권한</span>
          <span className={member.role === 'OWNER' ? styles.ownerBadge : styles.memberBadge}>{member.role}</span>
        </div>

        {isCreator && <p className={styles.hint}>최초 생성자의 OWNER 권한은 변경할 수 없습니다.</p>}
        {isSelf && !isCreator && <p className={styles.hint}>자신의 OWNER 권한은 직접 회수할 수 없습니다.</p>}
        {!creatorKnown && isOwner && member.role === 'OWNER' && !isSelf && <p className={styles.hint}>최초 생성자 정보가 없어 강등할 수 없습니다.</p>}
        {error && <p className={styles.error} role="alert">{error}</p>}

        {(canChangeRole || canRemove) && (
          <div className={styles.managementActions}>
            {canChangeRole && (
              <button
                className={styles.primaryButton}
                type="button"
                disabled={submitting}
                onClick={() => {
                  const label = nextRole === 'OWNER' ? 'OWNER로 승격' : 'MEMBER로 변경';
                  if (window.confirm(`${member.name}님을 ${label}하시겠습니까?`)) {
                    runAction(() => onChangeRole(member));
                  }
                }}
              >
                {submitting ? '처리 중...' : nextRole === 'OWNER' ? 'OWNER로 승격' : 'MEMBER로 변경'}
              </button>
            )}
            {canRemove && (
              <button
                className={styles.dangerButton}
                type="button"
                disabled={submitting}
                onClick={() => {
                  if (window.confirm(`${member.name}님을 팀에서 내보내시겠습니까?`)) {
                    runAction(() => onRemove(member));
                  }
                }}
              >팀에서 내보내기</button>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={onClose} disabled={submitting}>닫기</button>
        </div>
      </div>
    </div>
  );
}

export default TeamMemberModal;
