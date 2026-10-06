package com.teammate.backend.task.service;

import com.teammate.backend.task.dto.CreateTaskRequest;
import com.teammate.backend.task.dto.TaskResponse;
import com.teammate.backend.task.entity.Task;
import com.teammate.backend.task.repository.TaskRepository;
import com.teammate.backend.team.entity.Team;
import com.teammate.backend.team.repository.TeamMemberRepository;
import com.teammate.backend.team.repository.TeamRepository;
import com.teammate.backend.user.entity.User;
import com.teammate.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.teammate.backend.task.dto.UpdateTaskStatusRequest;
import com.teammate.backend.task.dto.UpdateTaskRequest;
import com.teammate.backend.task.dto.TaskProgressResponse;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    public TaskService(
            TaskRepository taskRepository,
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            UserRepository userRepository
    ) {
        this.taskRepository = taskRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
    }

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
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());

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

        task.setStatus(request.getStatus());

        return new TaskResponse(task);
    }
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

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDueDate(request.getDueDate());

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

        return new TaskResponse(task);
    }
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

        taskRepository.delete(task);
    }
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
}