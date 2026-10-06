package com.teammate.backend.schedule.service;

import com.teammate.backend.schedule.dto.CreateScheduleRequest;
import com.teammate.backend.schedule.dto.ScheduleResponse;
import com.teammate.backend.schedule.entity.Schedule;
import com.teammate.backend.schedule.repository.ScheduleRepository;
import com.teammate.backend.team.entity.Team;
import com.teammate.backend.team.repository.TeamMemberRepository;
import com.teammate.backend.team.repository.TeamRepository;
import com.teammate.backend.user.entity.User;
import com.teammate.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.teammate.backend.schedule.dto.UpdateScheduleRequest;
import com.teammate.backend.team.entity.TeamMember;

import java.util.List;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    public ScheduleService(
            ScheduleRepository scheduleRepository,
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            UserRepository userRepository
    ) {
        this.scheduleRepository = scheduleRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ScheduleResponse createSchedule(
            Long teamId,
            CreateScheduleRequest request,
            String loginId
    ) {
        User requester = userRepository.findByLoginId(loginId)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        boolean isMember = teamMemberRepository
                .existsByTeamTeamIdAndUserUserId(
                        teamId,
                        requester.getUserId()
                );

        if (!isMember) {
            throw new IllegalArgumentException(
                    "해당 팀의 일정을 생성할 권한이 없습니다."
            );
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() ->
                        new IllegalArgumentException("팀을 찾을 수 없습니다."));

        if (request.getEndAt() != null
                && request.getEndAt().isBefore(request.getStartAt())) {
            throw new IllegalArgumentException(
                    "종료 시간은 시작 시간보다 빠를 수 없습니다."
            );
        }

        Schedule schedule = new Schedule();
        schedule.setTeam(team);
        schedule.setCreatedBy(requester);
        schedule.setTitle(request.getTitle());
        schedule.setDescription(request.getDescription());
        schedule.setStartAt(request.getStartAt());
        schedule.setEndAt(request.getEndAt());

        Schedule savedSchedule =
                scheduleRepository.save(schedule);

        return new ScheduleResponse(savedSchedule);
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> getSchedules(
            Long teamId,
            String loginId
    ) {
        User requester = userRepository.findByLoginId(loginId)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        boolean isMember = teamMemberRepository
                .existsByTeamTeamIdAndUserUserId(
                        teamId,
                        requester.getUserId()
                );

        if (!isMember) {
            throw new IllegalArgumentException(
                    "해당 팀의 일정을 조회할 권한이 없습니다."
            );
        }

        return scheduleRepository
                .findByTeamTeamIdOrderByStartAtAsc(teamId)
                .stream()
                .map(ScheduleResponse::new)
                .toList();
    }
    @Transactional
    public ScheduleResponse updateSchedule(
            Long teamId,
            Long scheduleId,
            UpdateScheduleRequest request,
            String loginId
    ) {
        User requester = userRepository.findByLoginId(loginId)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        boolean isMember = teamMemberRepository
                .existsByTeamTeamIdAndUserUserId(
                        teamId,
                        requester.getUserId()
                );

        if (!isMember) {
            throw new IllegalArgumentException(
                    "해당 팀의 일정을 수정할 권한이 없습니다."
            );
        }

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() ->
                        new IllegalArgumentException("일정을 찾을 수 없습니다."));

        if (!schedule.getTeam().getTeamId().equals(teamId)) {
            throw new IllegalArgumentException(
                    "해당 팀의 일정이 아닙니다."
            );
        }

        boolean isCreator =
                schedule.getCreatedBy().getUserId()
                        .equals(requester.getUserId());

        boolean isOwner = teamMemberRepository
                .existsByTeamTeamIdAndUserUserIdAndRole(
                        teamId,
                        requester.getUserId(),
                        TeamMember.TeamRole.OWNER
                );

        if (!isCreator && !isOwner) {
            throw new IllegalArgumentException(
                    "자신이 생성한 일정만 수정할 수 있습니다."
            );
        }

        if (request.getEndAt() != null
                && request.getEndAt().isBefore(request.getStartAt())) {
            throw new IllegalArgumentException(
                    "종료 시간은 시작 시간보다 빠를 수 없습니다."
            );
        }

        schedule.setTitle(request.getTitle());
        schedule.setDescription(request.getDescription());
        schedule.setStartAt(request.getStartAt());
        schedule.setEndAt(request.getEndAt());

        return new ScheduleResponse(schedule);
    }
    @Transactional
    public void deleteSchedule(
            Long teamId,
            Long scheduleId,
            String loginId
    ) {
        User requester = userRepository.findByLoginId(loginId)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        boolean isMember = teamMemberRepository
                .existsByTeamTeamIdAndUserUserId(
                        teamId,
                        requester.getUserId()
                );

        if (!isMember) {
            throw new IllegalArgumentException(
                    "해당 팀의 일정을 삭제할 권한이 없습니다."
            );
        }

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() ->
                        new IllegalArgumentException("일정을 찾을 수 없습니다."));

        if (!schedule.getTeam().getTeamId().equals(teamId)) {
            throw new IllegalArgumentException(
                    "해당 팀의 일정이 아닙니다."
            );
        }

        boolean isCreator =
                schedule.getCreatedBy().getUserId()
                        .equals(requester.getUserId());

        boolean isOwner = teamMemberRepository
                .existsByTeamTeamIdAndUserUserIdAndRole(
                        teamId,
                        requester.getUserId(),
                        TeamMember.TeamRole.OWNER
                );

        if (!isCreator && !isOwner) {
            throw new IllegalArgumentException(
                    "자신이 생성한 일정만 삭제할 수 있습니다."
            );
        }

        scheduleRepository.delete(schedule);
    }
}