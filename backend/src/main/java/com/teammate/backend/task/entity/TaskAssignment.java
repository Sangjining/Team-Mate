package com.teammate.backend.task.entity;

import com.teammate.backend.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/** 팀 업무 담당 신청 내역. 실제 담당자는 Task.assignee에 저장합니다. */
@Entity
@Table(name = "task_assignments", indexes = {
        @Index(name = "idx_task_assignment_task_status", columnList = "task_id,status"),
        @Index(name = "idx_task_assignment_user", columnList = "user_id")
})
public class TaskAssignment {

    public enum Status {
        PENDING, APPROVED, REJECTED, CANCELLED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "assignment_id")
    private Long assignmentId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private Status status = Status.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = Status.PENDING;
    }

    public Long getAssignmentId() { return assignmentId; }
    public Task getTask() { return task; }
    public User getUser() { return user; }
    public Status getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }

    public void setTask(Task task) { this.task = task; }
    public void setUser(User user) { this.user = user; }
    public void setStatus(Status status) { this.status = status; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
