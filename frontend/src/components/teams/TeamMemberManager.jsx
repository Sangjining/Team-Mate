import { useEffect, useState } from 'react';
import TeamMemberModal from './TeamMemberModal';
import styles from './TeamMemberManager.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function apiRequest(path, method = 'GET', body, signal) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    signal,
  });
  const raw = await response.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { /* empty or non-JSON response */ }
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `요청에 실패했습니다. (HTTP ${response.status})`);
  }
  return data;
}

function TeamMemberManager({ teamId, members, setMembers }) {
  const [loginId, setLoginId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [creatorId, setCreatorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setCurrentUser(null);
    setCreatorId(null);
    setSelectedUserId(null);
    setLoading(true);
    setError('');
    setSuccess('');

    async function loadInfo() {
      try {
        const [user, team] = await Promise.all([
          apiRequest('/api/users/me', 'GET', undefined, controller.signal),
          apiRequest(`/api/teams/${teamId}`, 'GET', undefined, controller.signal),
        ]);
        if (controller.signal.aborted) return;
        setCurrentUser(user);
        setCreatorId(team?.createdByUserId ?? null);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadInfo();
    return () => controller.abort();
  }, [teamId]);

  const currentMember = members.find((member) =>
    (currentUser?.userId != null && String(member.userId) === String(currentUser.userId)) ||
    (currentUser?.loginId && member.loginId === currentUser.loginId)
  );
  const isOwner = currentMember?.role === 'OWNER';
  const selectedMember = members.find((member) => String(member.userId) === String(selectedUserId));
  const isCreator = (member) => creatorId != null && String(member.userId) === String(creatorId);

  const handleAddMember = async (event) => {
    event.preventDefault();
    const targetLoginId = loginId.trim();
    if (!isOwner || !targetLoginId || submitting) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const created = await apiRequest(`/api/teams/${teamId}/members`, 'POST', { loginId: targetLoginId });
      setMembers((prev) => [...prev, created]);
      setLoginId('');
      setSuccess('팀원이 추가되었습니다.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (member) => {
    if (!isOwner || submitting) return;
    const nextRole = member.role === 'OWNER' ? 'MEMBER' : 'OWNER';
    if (nextRole === 'MEMBER') {
      if (creatorId == null) throw new Error('최초 생성자 정보를 확인할 수 없어 강등할 수 없습니다.');
      if (isCreator(member)) throw new Error('최초 생성자의 OWNER 권한은 회수할 수 없습니다.');
      if (String(member.userId) === String(currentMember?.userId)) throw new Error('자신의 OWNER 권한은 회수할 수 없습니다.');
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const updated = await apiRequest(
        `/api/teams/${teamId}/members/${member.userId}/role`,
        'PATCH',
        { role: nextRole }
      );
      setMembers((prev) => prev.map((item) =>
        String(item.userId) === String(member.userId)
          ? { ...item, ...(updated && typeof updated === 'object' ? updated : {}), role: nextRole }
          : item
      ));
      setSuccess(`${member.name}님의 권한이 ${nextRole}로 변경되었습니다.`);
      setSelectedUserId(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (member) => {
    if (!isOwner || submitting || member.role === 'OWNER') return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await apiRequest(`/api/teams/${teamId}/members/${member.userId}`, 'DELETE');
      setMembers((prev) => prev.filter((item) => String(item.userId) !== String(member.userId)));
      setSuccess(`${member.name}님을 팀에서 내보냈습니다.`);
      setSelectedUserId(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <h2>팀원 관리</h2>
        <p>현재 팀원 {members.length}명</p>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {success && <p className={styles.success} role="status">{success}</p>}
      {loading && <p className={styles.muted}>사용자 권한을 확인하는 중입니다...</p>}

      {isOwner && (
        <form className={styles.addForm} onSubmit={handleAddMember}>
          <input
            className={styles.input}
            type="text"
            value={loginId}
            onChange={(event) => setLoginId(event.target.value)}
            placeholder="추가할 사용자의 로그인 ID"
            aria-label="추가할 사용자의 로그인 ID"
            disabled={submitting}
            required
          />
          <button className={styles.addButton} type="submit" disabled={submitting}>
            {submitting ? '처리 중...' : '팀원 추가'}
          </button>
        </form>
      )}

      <div className={styles.memberList}>
        {members.map((member) => (
          <button
            key={member.userId}
            type="button"
            className={styles.memberCard}
            onClick={() => { setError(''); setSelectedUserId(member.userId); }}
            aria-label={`${member.name} 팀원 정보 및 관리`}
          >
            <span className={styles.memberInfo}>
              <span className={styles.avatar}>{member.name?.charAt(0) || '?'}</span>
              <span className={styles.memberText}>
                <span className={styles.memberName}>
                  {member.name}
                  {isCreator(member) && <span className={styles.creatorLabel}>👑 최초 생성자</span>}
                </span>
                <span className={styles.loginId}>@{member.loginId}</span>
              </span>
            </span>
            <span className={styles.cardRight}>
              <span className={member.role === 'OWNER' ? styles.ownerBadge : styles.memberBadge}>
                {member.role}
              </span>
              <span className={styles.chevron} aria-hidden="true">›</span>
            </span>
          </button>
        ))}
      </div>

      <TeamMemberModal
        member={selectedMember || null}
        isOwner={isOwner}
        isCreator={selectedMember ? isCreator(selectedMember) : false}
        creatorKnown={creatorId != null}
        isSelf={selectedMember ? String(selectedMember.userId) === String(currentMember?.userId) : false}
        submitting={submitting}
        onClose={() => { if (!submitting) setSelectedUserId(null); }}
        onChangeRole={handleChangeRole}
        onRemove={handleRemoveMember}
      />
    </section>
  );
}

export default TeamMemberManager;
