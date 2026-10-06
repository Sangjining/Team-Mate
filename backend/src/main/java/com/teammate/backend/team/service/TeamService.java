package com.teammate.backend.team.service;

import com.teammate.backend.team.dto.CreateTeamRequest;
import com.teammate.backend.team.dto.TeamResponse;
import com.teammate.backend.team.entity.Team;
import com.teammate.backend.team.entity.TeamMember;
import com.teammate.backend.team.repository.TeamMemberRepository;
import com.teammate.backend.team.repository.TeamRepository;
import com.teammate.backend.user.entity.User;
import com.teammate.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.teammate.backend.team.dto.TeamMemberResponse;
import com.teammate.backend.team.dto.AddTeamMemberRequest;
import com.teammate.backend.team.dto.UpdateTeamRequest;
import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    public TeamService(
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            UserRepository userRepository
    ) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public TeamResponse createTeam(CreateTeamRequest request, String loginId) {

        // 현재 로그인한 사용자 조회
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 팀 생성
        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());

        Team savedTeam = teamRepository.save(team);

        // 팀을 만든 사용자를 OWNER로 등록
        TeamMember teamMember = new TeamMember();
        teamMember.setTeam(savedTeam);
        teamMember.setUser(user);
        teamMember.setRole(TeamMember.TeamRole.OWNER);

        teamMemberRepository.save(teamMember);

        return new TeamResponse(savedTeam);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> getMyTeams(String loginId) {

        // 현재 로그인한 사용자 조회
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 사용자가 참여하고 있는 팀 목록 조회
        return teamMemberRepository.findByUserUserId(user.getUserId())
                .stream()
                .map(teamMember -> new TeamResponse(teamMember.getTeam()))
                .toList();
    }
    @Transactional(readOnly = true)
    public TeamResponse getTeam(Long teamId, String loginId) {

        // 현재 로그인한 사용자 조회
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 해당 팀에 소속된 사용자인지 확인
        boolean isMember = teamMemberRepository
                .existsByTeamTeamIdAndUserUserId(teamId, user.getUserId());

        if (!isMember) {
            throw new IllegalArgumentException("해당 팀에 접근할 권한이 없습니다.");
        }

        // 팀 조회
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다."));

        return new TeamResponse(team);
    }
    @Transactional(readOnly = true)
    public List<TeamMemberResponse> getTeamMembers(Long teamId, String loginId) {

        // 현재 로그인한 사용자 조회
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 현재 사용자가 해당 팀의 멤버인지 확인
        boolean isMember = teamMemberRepository
                .existsByTeamTeamIdAndUserUserId(teamId, user.getUserId());

        if (!isMember) {
            throw new IllegalArgumentException("해당 팀에 접근할 권한이 없습니다.");
        }

        // 해당 팀의 모든 팀원 조회
        return teamMemberRepository.findByTeamTeamId(teamId)
                .stream()
                .map(TeamMemberResponse::new)
                .toList();
    }
    @Transactional
    public TeamMemberResponse addTeamMember(
            Long teamId,
            AddTeamMemberRequest request,
            String loginId
    ) {
        // 요청한 사용자 조회
        User requester = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 요청한 사용자가 해당 팀의 OWNER인지 확인
        boolean isOwner = teamMemberRepository
                .existsByTeamTeamIdAndUserUserIdAndRole(
                        teamId,
                        requester.getUserId(),
                        TeamMember.TeamRole.OWNER
                );

        if (!isOwner) {
            throw new IllegalArgumentException("팀원 추가 권한이 없습니다.");
        }

        // 추가할 사용자 조회
        User targetUser = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new IllegalArgumentException("추가할 사용자를 찾을 수 없습니다."));

        // 이미 팀에 들어있는 사용자인지 확인
        boolean alreadyMember = teamMemberRepository
                .existsByTeamTeamIdAndUserUserId(
                        teamId,
                        targetUser.getUserId()
                );

        if (alreadyMember) {
            throw new IllegalArgumentException("이미 팀에 참여 중인 사용자입니다.");
        }

        // 팀 조회
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다."));

        // MEMBER 권한으로 팀에 추가
        TeamMember teamMember = new TeamMember();
        teamMember.setTeam(team);
        teamMember.setUser(targetUser);
        teamMember.setRole(TeamMember.TeamRole.MEMBER);

        TeamMember savedTeamMember = teamMemberRepository.save(teamMember);

        return new TeamMemberResponse(savedTeamMember);
    }
    @Transactional
    public void removeTeamMember(
            Long teamId,
            Long targetUserId,
            String loginId
    ) {
        // 요청한 사용자 조회
        User requester = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 요청한 사용자가 해당 팀의 OWNER인지 확인
        boolean isOwner = teamMemberRepository
                .existsByTeamTeamIdAndUserUserIdAndRole(
                        teamId,
                        requester.getUserId(),
                        TeamMember.TeamRole.OWNER
                );

        if (!isOwner) {
            throw new IllegalArgumentException("팀원 삭제 권한이 없습니다.");
        }

        // 삭제할 팀원 조회
        TeamMember targetMember = teamMemberRepository
                .findByTeamTeamIdAndUserUserId(teamId, targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("해당 팀원을 찾을 수 없습니다."));

        // OWNER는 이 API로 삭제할 수 없음
        if (targetMember.getRole() == TeamMember.TeamRole.OWNER) {
            throw new IllegalArgumentException("팀 OWNER는 삭제할 수 없습니다.");
        }

        // 팀원 삭제
        teamMemberRepository.delete(targetMember);
    }
    @Transactional
    public TeamResponse updateTeam(
            Long teamId,
            UpdateTeamRequest request,
            String loginId
    ) {
        // 요청한 사용자 조회
        User requester = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 해당 팀의 OWNER인지 확인
        boolean isOwner = teamMemberRepository
                .existsByTeamTeamIdAndUserUserIdAndRole(
                        teamId,
                        requester.getUserId(),
                        TeamMember.TeamRole.OWNER
                );

        if (!isOwner) {
            throw new IllegalArgumentException("팀 수정 권한이 없습니다.");
        }

        // 수정할 팀 조회
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다."));

        // 팀 정보 수정
        team.setName(request.getName());
        team.setDescription(request.getDescription());

        return new TeamResponse(team);
    }
    @Transactional
    public TeamResponse completeTeam(Long teamId, String loginId) {

        User requester = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        boolean isOwner = teamMemberRepository
                .existsByTeamTeamIdAndUserUserIdAndRole(
                        teamId,
                        requester.getUserId(),
                        TeamMember.TeamRole.OWNER
                );

        if (!isOwner) {
            throw new IllegalArgumentException("팀 완료 권한이 없습니다.");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다."));

        team.setStatus(Team.Status.COMPLETED);

        return new TeamResponse(team);
    }

    @Transactional
    public TeamResponse reopenTeam(Long teamId, String loginId) {

        User requester = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        boolean isOwner = teamMemberRepository
                .existsByTeamTeamIdAndUserUserIdAndRole(
                        teamId,
                        requester.getUserId(),
                        TeamMember.TeamRole.OWNER
                );

        if (!isOwner) {
            throw new IllegalArgumentException("팀 재개 권한이 없습니다.");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다."));

        team.setStatus(Team.Status.ACTIVE);

        return new TeamResponse(team);
    }
    @Transactional
    public void deleteTeam(Long teamId, String loginId) {

        // 요청한 사용자 조회
        User requester = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // OWNER인지 확인
        boolean isOwner = teamMemberRepository
                .existsByTeamTeamIdAndUserUserIdAndRole(
                        teamId,
                        requester.getUserId(),
                        TeamMember.TeamRole.OWNER
                );

        if (!isOwner) {
            throw new IllegalArgumentException("팀 삭제 권한이 없습니다.");
        }

        // 삭제할 팀 조회
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다."));

        // 팀원 관계 먼저 삭제
        teamMemberRepository.deleteByTeamTeamId(teamId);

        // 팀 삭제
        teamRepository.delete(team);
    }
}