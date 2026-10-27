import { useEffect, useState } from 'react';
import styles from './ScheduleModal.module.css';

function toInputDateTime(value) {
  if (!value) return '';
  return String(value).slice(0, 16);
}

function formatDateTime(value) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 16);
}

export default function ScheduleModal({ schedule, initialDate, canManage, onClose, onSave, onDelete }) {
  const isNew = !schedule;
  const [editing, setEditing] = useState(isNew);
  const [title, setTitle] = useState(schedule?.title ?? '');
  const [description, setDescription] = useState(schedule?.description ?? '');
  const [startAt, setStartAt] = useState(toInputDateTime(schedule?.startAt) || `${initialDate}T09:00`);
  const [endAt, setEndAt] = useState(toInputDateTime(schedule?.endAt));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function onKeyDown(event) { if (event.key === 'Escape' && !busy) onClose(); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [busy, onClose]);

  async function handleSave(event) {
    event.preventDefault();
    if (busy) return;
    if (!title.trim() || title.trim().length > 100) return setError('일정 제목을 1~100자로 입력해주세요.');
    if (description.length > 1000) return setError('일정 설명은 1000자 이하로 입력해주세요.');
    if (!startAt) return setError('시작 시간은 필수입니다.');
    if (endAt && new Date(endAt) < new Date(startAt)) return setError('종료 시간은 시작 시간보다 빠를 수 없습니다.');
    setBusy(true); setError('');
    try {
      await onSave({ title: title.trim(), description: description.trim(), startAt: `${startAt}:00`, endAt: endAt ? `${endAt}:00` : null }, schedule?.scheduleId);
      onClose();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function handleDelete() {
    if (busy || !window.confirm('이 일정을 삭제하시겠습니까?')) return;
    setBusy(true); setError('');
    try { await onDelete(schedule.scheduleId); onClose(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="schedule-modal-title">
        <div className={styles.modalHeader}>
          <div><h2 id="schedule-modal-title">{isNew ? '새 일정 등록' : editing ? '일정 수정' : '일정 상세'}</h2><p>{isNew ? '팀의 새로운 일정을 등록합니다.' : '팀 일정 정보를 확인합니다.'}</p></div>
          <button type="button" className={styles.closeButton} onClick={onClose} disabled={busy} aria-label="닫기">×</button>
        </div>
        {editing ? (
          <form onSubmit={handleSave}>
            <div className={styles.field}><label htmlFor="schedule-title">일정 제목 *</label><input id="schedule-title" autoFocus required maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="일정 제목" /></div>
            <div className={styles.field}><label htmlFor="schedule-desc">설명</label><textarea id="schedule-desc" rows={4} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="일정 설명 (선택)" /></div>
            <div className={styles.field}><label htmlFor="schedule-start">시작 시간 *</label><input id="schedule-start" type="datetime-local" required value={startAt} onChange={(e) => setStartAt(e.target.value)} /></div>
            <div className={styles.field}><label htmlFor="schedule-end">종료 시간 (선택)</label><input id="schedule-end" type="datetime-local" value={endAt} min={startAt} onChange={(e) => setEndAt(e.target.value)} /></div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <div className={styles.actions}><button type="button" className={styles.secondary} disabled={busy} onClick={() => isNew ? onClose() : (setEditing(false), setError(''))}>취소</button><button type="submit" className={styles.primary} disabled={busy}>{busy ? '저장 중...' : isNew ? '일정 등록' : '변경사항 저장'}</button></div>
          </form>
        ) : (
          <div>
            <div className={styles.detail}><span>제목</span><strong>{schedule.title}</strong></div>
            <div className={styles.detail}><span>작성자</span><strong>{schedule.createdByName || '-'}</strong></div>
            <div className={styles.detail}><span>시작</span><strong>{formatDateTime(schedule.startAt)}</strong></div>
            <div className={styles.detail}><span>종료</span><strong>{formatDateTime(schedule.endAt)}</strong></div>
            <div className={styles.detail}><span>설명</span><p>{schedule.description || '설명이 없습니다.'}</p></div>
            {error && <p className={styles.error} role="alert">{error}</p>}
            <div className={styles.actions}>
              {canManage && <><button type="button" className={styles.danger} onClick={handleDelete} disabled={busy}>삭제</button><button type="button" className={styles.primary} onClick={() => setEditing(true)} disabled={busy}>수정</button></>}
              <button type="button" className={styles.secondary} onClick={onClose} disabled={busy}>닫기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
