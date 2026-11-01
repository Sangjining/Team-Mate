package com.teammate.backend.task.service;

import com.teammate.backend.task.dto.CreateTaskRequest;
import com.teammate.backend.task.dto.TaskProgressResponse;
import com.teammate.backend.task.dto.TaskResponse;
import com.teammate.backend.task.dto.UpdateTaskRequest;
import com.teammate.backend.task.dto.UpdateTaskStatusRequest;
import com.teammate.backend.task.entity.Task;
import com.teammate.backend.task.entity.TaskAssignment;
import com.teammate.backend.task.repository.TaskAssignmentRepository;
import com.teammate.backend.team.entity.TeamMember;
import java.time.LocalDateTime;
import com.teammate.backend.task.repository.TaskRepository;
import com.teammate.backend.team.entity.Team;
import com.teammate.backend.team.repository.TeamMemberRepository;
import com.teammate.backend.team.repository.TeamRepository;
import com.teammate.backend.user.entity.User;
import com.teammate.backend.user.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository assignmentRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    public TaskService(
            TaskRepository taskRepository,
            TaskAssignmentRepository assignmentRepository,
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            UserRepository userRepository
    ) {
        this.taskRepository = taskRepository;
        this.assignmentRepository = assignmentRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }

    // 업무 생성
    @Transactional
    public TaskResponse createTask(
            Long teamId,
            CreateTaskRequest request,
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
                    "해당 팀의 업무를 생성할 권한이 없습니다."
            );
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() ->
                        new IllegalArgumentException("팀을 찾을 수 없습니다."));

        Task task = new Task();
        task.setTeam(team);
        task.setCreatedBy(requester);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());
        task.setPriority(request.getPriority());

        // 기본 상태는 Task 엔티티의 BACKLOG 사용

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("담당자를 찾을 수 없습니다."));

            boolean isAssigneeMember = teamMemberRepository
                    .existsByTeamTeamIdAndUserUserId(
                            teamId,
                            assignee.getUserId()
                    );

            if (!isAssigneeMember) {
                throw new IllegalArgumentException(
                        "해당 사용자는 이 팀의 팀원이 아닙니다."
                );
            }

            task.setAssignee(assignee);
        }

        Task savedTask = taskRepository.save(task);

        return new TaskResponse(savedTask);
    }

    // 팀 업무 목록 조회
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(
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
                    "해당 팀의 업무를 조회할 권한이 없습니다."
            );
        }

        return taskRepository.findByTeamTeamId(teamId)
                .stream()
                .map(TaskResponse::new)
                .toList();
    }

    // 업무 상태 변경 (칸반 보드)
    @Transactional
    public TaskResponse updateTaskStatus(
            Long teamId,
            Long taskId,
            UpdateTaskStatusRequest request,
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
                    "해당 팀의 업무 상태를 변경할 권한이 없습니다."
            );
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("업무를 찾을 수 없습니다."));

        if (!task.getTeam().getTeamId().equals(teamId)) {
            throw new IllegalArgumentException(
                    "해당 팀의 업무가 아닙니다."
            );
        }

        requireTaskEditor(teamId, requester, task);

        // 상태값 검증
        if (request.getStatus() == null) {
            throw new IllegalArgumentException(
                    "변경할 업무 상태를 입력해주세요."
            );
        }

        // 칸반 보드 6단계 상태 변경
        task.setStatus(request.getStatus());

        return new TaskResponse(task);
    }

    // 업무 정보 수정
    @Transactional
    public TaskResponse updateTask(
            Long teamId,
            Long taskId,
            UpdateTaskRequest request,
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
                    "해당 팀의 업무를 수정할 권한이 없습니다."
            );
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("업무를 찾을 수 없습니다."));

        if (!task.getTeam().getTeamId().equals(teamId)) {
            throw new IllegalArgumentException(
                    "해당 팀의 업무가 아닙니다."
            );
        }

        requireTaskEditor(teamId, requester, task);

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());

        // 우선순위가 전달된 경우에만 변경 (기존 요청과 호환)
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }

        // OWNER 또는 업무 생성자만 이 지점에 도달합니다.
        // 생성자 정보가 없는 기존 업무는 OWNER만 수정할 수 있습니다.
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("담당자를 찾을 수 없습니다."));

            boolean isAssigneeMember = teamMemberRepository
                    .existsByTeamTeamIdAndUserUserId(
                            teamId,
                            assignee.getUserId()
                    );

            if (!isAssigneeMember) {
                throw new IllegalArgumentException(
                        "해당 사용자는 이 팀의 팀원이 아닙니다."
                );
            }

            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }

        // OWNER가 담당자를 직접 지정한 경우 기존 대기 신청을 종료합니다.
        if (task.getAssignee() != null) {
            cancelPendingAssignments(taskId);
        }

        return new TaskResponse(task);
    }

    // 업무 삭제
    @Transactional
    public void deleteTask(
            Long teamId,
            Long taskId,
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
                    "해당 팀의 업무를 삭제할 권한이 없습니다."
            );
        }

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException("업무를 찾을 수 없습니다."));

        if (!task.getTeam().getTeamId().equals(teamId)) {
            throw new IllegalArgumentException(
                    "해당 팀의 업무가 아닙니다."
            );
        }

        requireTaskEditor(teamId, requester, task);

        // 신청 내역이 업무를 참조하므로 먼저 삭제해 FK 충돌을 방지합니다.
        assignmentRepository.deleteByTaskTaskId(taskId);
        taskRepository.delete(task);
    }

    // 팀 전체 진행률 조회
    @Transactional(readOnly = true)
    public TaskProgressResponse getTaskProgress(
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
                    "해당 팀의 진척도를 조회할 권한이 없습니다."
            );
        }

        long totalTasks =
                taskRepository.countByTeamTeamId(teamId);

        long completedTasks =
                taskRepository.countByTeamTeamIdAndStatus(
                        teamId,
                        Task.Status.DONE
                );

        int progress = totalTasks == 0
                ? 0
                : (int) Math.round(
                (double) completedTasks / totalTasks * 100
        );

        return new TaskProgressResponse(
                totalTasks,
                completedTasks,
                progress
        );
    }

    private void requireTaskEditor(Long teamId, User requester, Task task) {
        boolean creator = task.getCreatedBy() != null
                && requester.getUserId().equals(task.getCreatedBy().getUserId());
        if (!isOwner(teamId, requester.getUserId()) && !creator) {
            throw new IllegalArgumentException(
                    "업무 수정 및 삭제는 팀 OWNER 또는 해당 업무 생성자만 가능합니다.");
        }
    }

    private boolean isOwner(Long teamId, Long userId) {
        return teamMemberRepository.existsByTeamTeamIdAndUserUserIdAndRole(
                teamId, userId, TeamMember.TeamRole.OWNER);
    }

    private void cancelPendingAssignments(Long taskId) {
        LocalDateTime now = LocalDateTime.now();
        for (TaskAssignment assignment : assignmentRepository.findByTaskTaskIdAndStatus(
                taskId, TaskAssignment.Status.PENDING)) {
            assignment.setStatus(TaskAssignment.Status.CANCELLED);
            assignment.setReviewedAt(now);
        }
    }

}