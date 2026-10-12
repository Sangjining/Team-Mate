import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import KanbanBoard from '../../components/kanban/KanbanBoard';
import styles from './TeamDetailPage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const tabs = [
  { id: 'overview', label: '개요' },
  { id: 'tasks', label: '업무 관리' },
  { id: 'schedule', label: '일정' },
  { id: 'members', label: '팀원 관리' },
];

async function getTeamData(path, signal) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');

  const response = await fetch(`${API_BASE_URL}/api/teams/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `정보를 불러오지 못했습니다. (HTTP ${response.status})`);
  }
  return data;
}

function TeamDetailPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function loadTeam() {
      setLoading(true);
      setError('');
      setTeam(null);
      setMembers([]);
      try {
        const [teamResult, memberResult] = await Promise.all([
          getTeamData(teamId, controller.signal),
          getTeamData(`${teamId}/members`, controller.signal),
        ]);
        if (controller.signal.aborted) return;
        setTeam(teamResult);
        setMembers(Array.isArray(memberResult) ? memberResult : []);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadTeam();
    return () => controller.abort();
  }, [teamId]);

  if (loading) return <div className={styles.detailPage}><p>팀 정보를 불러오는 중입니다...</p></div>;

  if (error || !team) {
    return (
      <div className={styles.notFound}>
        <h2>팀 정보를 불러올 수 없습니다.</h2>
        <p role="alert">{error || '존재하지 않는 팀입니다.'}</p>
        <button type="button" onClick={() => navigate('/teams')}>내 팀으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className={styles.detailPage}>
      <button type="button" className={styles.backButton} onClick={() => navigate('/teams')}>
        ← 내 팀으로 돌아가기
      </button>

      <div className={styles.teamHeader}>
        <div className={styles.teamIcon}>👥</div>
        <div>
          <h1>{team.name}</h1>
          <p>{team.description || '팀 설명이 없습니다.'}</p>
          <span className={styles.memberCount}>👤 팀원 {members.length}명</span>
        </div>
      </div>

      <div className={styles.tabMenu}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className={styles.comingSoon}>
          <h2>팀 개요</h2>
          <p>팀의 전체 진행 상황을 확인하는 공간입니다.</p>
          <p>상세 통계는 이후에 추가할 예정입니다.</p>
        </div>
      )}

      {/* 칸반 보드는 다음 단계에서 실제 업무 API와 연결합니다. */}
      {activeTab === 'tasks' && <KanbanBoard teamId={teamId} />}

      {activeTab === 'schedule' && (
        <div className={styles.comingSoon}>
          <h2>일정 관리</h2>
          <p>팀 일정을 관리하는 기능은 추후 구현할 예정입니다.</p>
        </div>
      )}

      {activeTab === 'members' && (
        <div className={styles.comingSoon}>
          <h2>팀원 관리</h2>
          <p>현재 팀원 {members.length}명</p>
          <p>팀원 초대 및 관리 기능은 다음 단계에서 구현할 예정입니다.</p>
        </div>
      )}
    </div>
  );
}

export default TeamDetailPage;
