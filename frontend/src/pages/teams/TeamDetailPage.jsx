import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import KanbanBoard from '../../components/kanban/KanbanBoard';
import TeamOverview from '../../components/teams/TeamOverview';
import TeamCalendar from '../../components/teams/TeamCalendar';
import TeamMemberManager from '../../components/teams/TeamMemberManager';

import styles from './TeamDetailPage.module.css';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const tabs = [
  { id: 'overview', label: '개요' },
  { id: 'tasks', label: '업무 관리' },
  { id: 'schedule', label: '일정' },
  { id: 'members', label: '팀원 관리' },
];

async function getTeamData(path, signal) {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');
  }

  const response = await fetch(
    `${API_BASE_URL}/api/teams/${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal,
    }
  );

  const raw = await response.text();

  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      `정보를 불러오지 못했습니다. (HTTP ${response.status})`
    );
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
          getTeamData(
            `${teamId}/members`,
            controller.signal
          ),
        ]);

        if (controller.signal.aborted) return;

        setTeam(teamResult);
        setMembers(
          Array.isArray(memberResult) ? memberResult : []
        );
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTeam();

    return () => controller.abort();
  }, [teamId]);

  if (loading) {
    return (
      <div className={styles.detailPage}>
        <p>팀 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className={styles.notFound}>
        <h2>팀 정보를 불러올 수 없습니다.</h2>

        <p role="alert">
          {error || '존재하지 않는 팀입니다.'}
        </p>

        <button
          type="button"
          onClick={() => navigate('/teams')}
        >
          내 팀으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.detailPage}>
      {/* 팀 목록으로 돌아가기 */}
      <button
        type="button"
        className={styles.backButton}
        onClick={() => navigate('/teams')}
      >
        ← 내 팀으로 돌아가기
      </button>

      {/* 팀 정보 */}
      <div className={styles.teamHeader}>
        <div className={styles.teamIcon}>👥</div>

        <div>
          <h1>{team.name}</h1>

          <p>
            {team.description || '팀 설명이 없습니다.'}
          </p>

          <span className={styles.memberCount}>
            👤 팀원 {members.length}명
          </span>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className={styles.tabMenu}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${styles.tabButton} ${
              activeTab === tab.id ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 팀 개요 */}
      {activeTab === 'overview' && (
        <TeamOverview
          teamId={teamId}
          memberCount={members.length}
          onOpenTasks={() => setActiveTab('tasks')}
        />
      )}

      {/* 업무 관리 */}
      {activeTab === 'tasks' && (
        <KanbanBoard teamId={teamId} />
      )}

      {/* 일정 관리 */}
      {activeTab === 'schedule' && (
        <TeamCalendar
          teamId={teamId}
          members={members}
          onOpenTasks={() => setActiveTab('tasks')}
        />
      )}

      {/* 팀원 관리 */}
      {activeTab === 'members' && (
        <TeamMemberManager
          teamId={teamId}
          members={members}
          setMembers={setMembers}
        />
      )}
    </div>
  );
}

export default TeamDetailPage;