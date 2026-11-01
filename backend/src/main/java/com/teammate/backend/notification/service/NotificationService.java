package com.teammate.backend.notification.service;

import com.teammate.backend.notification.entity.Notification;
import com.teammate.backend.notification.repository.NotificationRepository;
import com.teammate.backend.task.entity.TaskAssignment;
import com.teammate.backend.user.entity.User;
import com.teammate.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // 신청 시 팀 OWNER 각각에 대해 호출합니다. OWNER 목록 조회는 연동 단계에서 처리합니다.
    @Transactional
    public Notification notifyAssignmentRequest(User owner, TaskAssignment assignment) {
        return save(owner, Notification.Type.TASK_ASSIGNMENT_REQUEST, assignment,
                assignment.getUser().getName() + "님이 '" + assignment.getTask().getTitle()
                        + "' 업무의 담당을 신청했습니다.");
    }

    // 승인 또는 반려 시 신청자에게 결과를 알립니다.
    @Transactional
    public Notification notifyAssignmentApproved(TaskAssignment assignment) {
        return save(assignment.getUser(), Notification.Type.TASK_ASSIGNMENT_APPROVED, assignment,
                "'" + assignment.getTask().getTitle() + "' 업무의 담당 신청이 승인되었습니다.");
    }

    @Transactional
    public Notification notifyAssignmentRejected(TaskAssignment assignment) {
        return save(assignment.getUser(), Notification.Type.TASK_ASSIGNMENT_REJECTED, assignment,
                "'" + assignment.getTask().getTitle() + "' 업무의 담당 신청이 반려되었습니다.");
    }

    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications(String loginId) {
        User user = findUser(loginId);
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(user.getUserId());
    }

    @Transactional(readOnly = true)
    public long getMyNotificationCount(String loginId) {
        User user = findUser(loginId);
        return notificationRepository.countByRecipientUserId(user.getUserId());
    }

    // 수신자 본인만 알림을 삭제할 수 있습니다. 업무/담당 신청 기록은 삭제하지 않습니다.
    @Transactional
    public void deleteMyNotification(Long notificationId, String loginId) {
        User user = findUser(loginId);
        Notification notification = notificationRepository
                .findByNotificationIdAndRecipientUserId(notificationId, user.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다."));
        notificationRepository.delete(notification);
    }

    private Notification save(User recipient, Notification.Type type,
                              TaskAssignment assignment, String message) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setType(type);
        notification.setTeamId(assignment.getTask().getTeam().getTeamId());
        notification.setTaskId(assignment.getTask().getTaskId());
        notification.setAssignmentId(assignment.getAssignmentId());
        notification.setMessage(message);
        return notificationRepository.save(notification);
    }

    private User findUser(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }
}
