package com.teammate.backend.notification.entity;

import com.teammate.backend.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/** 사용자별 알림. 알림 삭제는 업무/담당 신청 기록에 영향을 주지 않습니다. */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notification_recipient_created", columnList = "recipient_id,created_at")
})
public class Notification {

    public enum Type {
        TASK_ASSIGNMENT_REQUEST,
        TASK_ASSIGNMENT_APPROVED,
        TASK_ASSIGNMENT_REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 40)
    private Type type;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "assignment_id")
    private Long assignmentId;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getNotificationId() { return notificationId; }
    public User getRecipient() { return recipient; }
    public Type getType() { return type; }
    public Long getTeamId() { return teamId; }
    public Long getTaskId() { return taskId; }
    public Long getAssignmentId() { return assignmentId; }
    public String getMessage() { return message; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setRecipient(User recipient) { this.recipient = recipient; }
    public void setType(Type type) { this.type = type; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }
    public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
    public void setMessage(String message) { this.message = message; }
}
