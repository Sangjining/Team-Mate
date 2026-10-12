import { useCallback, useEffect, useState } from 'react';
import styles from './TeamsPage.module.css';
import { useNavigate } from 'react-router-dom';

import CreateTeamModal from '../../components/teams/CreateTeamModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function teamRequest(method, path = '', body) {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('로그인이 필요합니다. 다시 로그인해주세요.');

  const response = await fetch(`${API_BASE_URL}/api/teams${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const raw = await response.text();
  let data;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
  if (!response.ok) {
    throw new Error(data?.message || data?.error || `요청에 실패했습니다. (HTTP ${response.status})`);
  }
  return data;
}

function TeamsPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const navigate = useNavigate();

  const loadTeams = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const result = await teamRequest('GET');
      setTeams(Array.isArray(result) ? result : []);
    } catch (error) {
      setPageError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  const handleCreateTeam = async (newTeam) => {
    const created = await teamRequest('POST', '', newTeam);
    // 생성 결과의 필드 구성이 달라도 서버 목록을 다시 조회하여 일치시킵니다.
    await loadTeams();
    return created;
  };

  // 팀 이름 검색
  const filteredTeams = teams.filter((team) =>
    (team.name || '').toLowerCase().includes(searchKeyword.trim().toLowerCase())
  );

  return (
    <div className={styles.teamsPage}>

      {/* 페이지 상단 */}
      <div className={styles.pageHeader}>
        <div>
          <h1>내 팀</h1>
          <p>참여 중인 팀을 확인하고 관리하세요.</p>
        </div>

        <button
          type="button"
          className={styles.createButton}
          onClick={() => setIsModalOpen(true)}
        >
          + 새 팀 만들기
        </button>
      </div>

      {/* 검색 영역 */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>

          <input
            type="text"
            placeholder="팀 이름으로 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        <span className={styles.teamCount}>
          총 {filteredTeams.length}개의 팀
        </span>
      </div>

      {pageError && (
        <p role="alert" style={{ color: '#dc2626', marginBottom: 16 }}>
          {pageError} <button type="button" onClick={loadTeams}>다시 시도</button>
        </p>
      )}

      {/* 팀 목록 */}
      {loading ? (
        <p>팀 목록을 불러오는 중입니다...</p>
      ) : filteredTeams.length > 0 ? (
        <div className={styles.teamGrid}>
          {filteredTeams.map((team) => (
            <div key={team.teamId} className={styles.teamCard}>

              <div className={styles.cardHeader}>
                <div className={styles.teamIcon}>👥</div>

                <div className={styles.teamTitle}>
                  <h2>{team.name}</h2>
                  <p>{team.description}</p>
                </div>
              </div>

              <div className={styles.memberInfo}>
                <span>👤</span>
                <span>팀원 {team.memberCount ?? 1}명</span>
              </div>

              {/* 진행률 */}
              <div className={styles.progressSection}>
                <div className={styles.progressHeader}>
                  <span>프로젝트 진행률</span>
                  <strong>{team.progress ?? 0}%</strong>
                </div>

                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${team.progress ?? 0}%` }}
                  />
                </div>
              </div>

              {/* 팀 상세 이동 */}
              <button
                type="button"
                className={styles.detailButton}
                onClick={() => navigate(`/teams/${team.teamId}`)}
              >
                팀 상세 보기 →
              </button>

            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h2>{searchKeyword ? '검색 결과가 없습니다.' : '참여 중인 팀이 없습니다.'}</h2>
          <p>{searchKeyword ? '다른 팀 이름으로 검색해 보세요.' : '새 팀 만들기로 첫 팀을 생성해 보세요.'}</p>
        </div>
      )}
      <CreateTeamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateTeam}
      />
    </div>

  );
}

export default TeamsPage;