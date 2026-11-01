package com.teammate.backend.task.service;

import com.teammate.backend.notification.entity.Notification;
import com.teammate.backend.notification.service.NotificationService;
import com.teammate.backend.task.entity.Task;
import com.teammate.backend.task.entity.TaskAssignment;
import com.teammate.backend.task.repository.TaskAssignmentRepository;
import com.teammate.backend.task.repository.TaskRepository;
import com.teammate.backend.team.entity.TeamMember;
import com.teammate.backend.team.repository.TeamMemberRepository;
import com.teammate.backend.user.entity.User;
import com.teammate.backend.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TaskAssignmentService {

    private final TaskAssignmentRepository assignmentRepository;
    private final TaskRepository taskRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EntityManager entityManager;

    public TaskAssignmentService(
            TaskAssignmentRepository assignmentRepository,
            TaskRepository taskRepository,
            TeamMemberRepository teamMemberRepository,
            UserRepository userRepository,
            NotificationService notificationService,
            EntityManager entityManager
    ) {
        this.assignmentRepository = assignmentRepository;
        this.taskRepository = taskRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.entityManager = entityManager;
    }

    // OWNER와 업무 생성자는 담당자를 직접 지정할 수 있으므로 신청 대상에서 제외
    @Transactional
    public TaskAssignment apply(Long teamId, Long taskId, String loginId) {
        User applicant = findUser(loginId);
        requireMember(teamId, applicant.getUserId());

        Task task = findTask(teamId, taskId);

        if (isOwner(teamId, applicant.getUserId())
                || isTaskCreator(task, applicant.getUserId())) {
            throw new IllegalStateException(
                    "OWNER 또는 업무 생성자는 담당자를 직접 지정할 수 있습니다."
            );
        }

        if (task.getAssignee() != null) {
            throw new IllegalStateException(
                    "이미 담당자가 지정된 업무입니다."
            );
        }

        if (assignmentRepository.findByTaskTaskIdAndUserUserIdAndStatus(
                taskId,
                applicant.getUserId(),
                TaskAssignment.Status.PENDING
        ).isPresent()) {
            throw new IllegalStateException(
                    "이미 승인 대기 중인 신청이 있습니다."
            );
        }

        TaskAssignment assignment = new TaskAssignment();
        assignment.setTask(task);
        assignment.setUser(applicant);
        assignment.setStatus(TaskAssignment.Status.PENDING);

        TaskAssignment saved = assignmentRepository.saveAndFlush(assignment);

        // 팀 OWNER 조회
        List<User> owners = entityManager.createQuery(
                        "select tm.user from TeamMember tm " +
                                "where tm.team.teamId = :teamId and tm.role = :role",
                        User.class
                )
                .setParameter("teamId", teamId)
                .setParameter("role", TeamMember.TeamRole.OWNER)
                .getResultList();

        // OWNER + 업무 생성자에게 알림 전송
        // 사용자 ID를 기준으로 중복 수신 방지
        Map<Long, User> recipients = new LinkedHashMap<>();

        for (User owner : owners) {
            recipients.put(owner.getUserId(), owner);
        }

        User creator = task.getCreatedBy();

        if (creator != null
                && teamMemberRepository.existsByTeamTeamIdAndUserUserId(
                teamId,
                creator.getUserId()
        )) {
            recipients.putIfAbsent(creator.getUserId(), creator);
        }

        for (User recipient : recipients.values()) {
            notificationService.notifyAssignmentRequest(recipient, saved);
        }

        return saved;
    }

    // OWNER는 팀 전체 신청 조회
    // MEMBER인 업무 생성자는 자신이 생성한 업무의 신청만 조회
    @Transactional(readOnly = true)
    public List<TaskAssignment> getPending(Long teamId, String loginId) {
        User requester = findUser(loginId);
        requireMember(teamId, requester.getUserId());

        List<TaskAssignment> pendingAssignments =
                assignmentRepository.findByTaskTeamTeamIdAndStatusOrderByCreatedAtAsc(
                        teamId,
                        TaskAssignment.Status.PENDING
                );

        if (isOwner(teamId, requester.getUserId())) {
            return pendingAssignments;
        }

        return pendingAssignments.stream()
                .filter(assignment ->
                        isTaskCreator(
                                assignment.getTask(),
                                requester.getUserId()
                        )
                )
                .toList();
    }

    // OWNER 또는 업무 생성자가 담당 신청 승인
    @Transactional
    public TaskAssignment approve(
            Long teamId,
            Long assignmentId,
            String loginId
    ) {
        User requester = findUser(loginId);

        TaskAssignment assignment =
                findPendingAssignment(teamId, assignmentId);

        Task task = assignment.getTask();

        requireAssignmentManager(
                teamId,
                task,
                requester.getUserId()
        );

        if (task.getAssignee() != null) {
            throw new IllegalStateException(
                    "이미 담당자가 지정된 업무입니다."
            );
        }

        User applicant = assignment.getUser();
        requireMember(teamId, applicant.getUserId());

        task.setAssignee(applicant);

        LocalDateTime now = LocalDateTime.now();

        assignment.setStatus(TaskAssignment.Status.APPROVED);
        assignment.setReviewedAt(now);

        // 한 명 승인 시 동일 업무의 나머지 신청은 자동 취소
        for (TaskAssignment other :
                assignmentRepository.findByTaskTaskIdAndStatus(
                        task.getTaskId(),
                        TaskAssignment.Status.PENDING
                )) {

            if (!other.getAssignmentId().equals(assignmentId)) {
                other.setStatus(TaskAssignment.Status.CANCELLED);
                other.setReviewedAt(now);
            }
        }

        // 해당 업무의 담당 신청 알림 정리
        clearRequestNotificationsForTask(task.getTaskId());

        // 승인된 신청자에게 결과 알림
        notificationService.notifyAssignmentApproved(assignment);

        return assignment;
    }

    // OWNER 또는 업무 생성자가 담당 신청 거절
    @Transactional
    public TaskAssignment reject(
            Long teamId,
            Long assignmentId,
            String loginId
    ) {
        User requester = findUser(loginId);

        TaskAssignment assignment =
                findPendingAssignment(teamId, assignmentId);

        requireAssignmentManager(
                teamId,
                assignment.getTask(),
                requester.getUserId()
        );

        assignment.setStatus(TaskAssignment.Status.REJECTED);
        assignment.setReviewedAt(LocalDateTime.now());

        // 해당 신청에 대한 알림 제거
        clearRequestNotifications(assignmentId);

        // 거절된 신청자에게 결과 알림
        notificationService.notifyAssignmentRejected(assignment);

        return assignment;
    }

    // 신청자 본인만 대기 중인 신청 취소 가능
    @Transactional
    public TaskAssignment cancel(
            Long teamId,
            Long assignmentId,
            String loginId
    ) {
        User requester = findUser(loginId);
        requireMember(teamId, requester.getUserId());

        TaskAssignment assignment =
                findPendingAssignment(teamId, assignmentId);

        if (!assignment.getUser().getUserId()
                .equals(requester.getUserId())) {
            throw new IllegalArgumentException(
                    "본인의 신청만 취소할 수 있습니다."
            );
        }

        assignment.setStatus(TaskAssignment.Status.CANCELLED);
        assignment.setReviewedAt(LocalDateTime.now());

        clearRequestNotifications(assignmentId);

        return assignment;
    }

    // 담당 신청 알림 제거
    // 승인/거절 결과 알림과 신청 이력은 유지
    private void clearRequestNotifications(Long assignmentId) {
        entityManager.createQuery(
                        "delete from Notification n " +
                                "where n.assignmentId = :assignmentId " +
                                "and n.type = :type"
                )
                .setParameter("assignmentId", assignmentId)
                .setParameter(
                        "type",
                        Notification.Type.TASK_ASSIGNMENT_REQUEST
                )
                .executeUpdate();
    }

    // 해당 업무의 모든 담당 신청 알림 제거
    private void clearRequestNotificationsForTask(Long taskId) {
        entityManager.createQuery(
                        "delete from Notification n " +
                                "where n.taskId = :taskId " +
                                "and n.type = :type"
                )
                .setParameter("taskId", taskId)
                .setParameter(
                        "type",
                        Notification.Type.TASK_ASSIGNMENT_REQUEST
                )
                .executeUpdate();
    }

    private User findUser(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );
    }

    private Task findTask(Long teamId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "업무를 찾을 수 없습니다."
                        )
                );

        if (!task.getTeam().getTeamId().equals(teamId)) {
            throw new IllegalArgumentException(
                    "해당 팀의 업무가 아닙니다."
            );
        }

        return task;
    }

    private TaskAssignment findPendingAssignment(
            Long teamId,
            Long assignmentId
    ) {
        TaskAssignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "담당 신청을 찾을 수 없습니다."
                        )
                );

        if (!assignment.getTask().getTeam().getTeamId().equals(teamId)) {
            throw new IllegalArgumentException(
                    "해당 팀의 신청이 아닙니다."
            );
        }

        if (assignment.getStatus() != TaskAssignment.Status.PENDING) {
            throw new IllegalStateException(
                    "이미 처리된 신청입니다."
            );
        }

        return assignment;
    }

    private void requireMember(Long teamId, Long userId) {
        if (!teamMemberRepository.existsByTeamTeamIdAndUserUserId(
                teamId,
                userId
        )) {
            throw new IllegalArgumentException(
                    "해당 팀의 팀원이 아닙니다."
            );
        }
    }

    private boolean isOwner(Long teamId, Long userId) {
        return teamMemberRepository
                .existsByTeamTeamIdAndUserUserIdAndRole(
                        teamId,
                        userId,
                        TeamMember.TeamRole.OWNER
                );
    }

    private boolean isTaskCreator(Task task, Long userId) {
        return task.getCreatedBy() != null
                && task.getCreatedBy().getUserId().equals(userId);
    }

    // OWNER 또는 해당 업무 생성자인 MEMBER만 신청 처리 가능
    private void requireAssignmentManager(
            Long teamId,
            Task task,
            Long userId
    ) {
        requireMember(teamId, userId);

        boolean owner = isOwner(teamId, userId);
        boolean creator = isTaskCreator(task, userId);

        if (!owner && !creator) {
            throw new IllegalArgumentException(
                    "팀 OWNER 또는 업무 생성자만 담당 신청을 처리할 수 있습니다."
            );
        }
    }
}