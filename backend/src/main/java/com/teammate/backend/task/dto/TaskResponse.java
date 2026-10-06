package com.teammate.backend.task.dto;

import com.teammate.backend.task.entity.Task;

import java.time.LocalDateTime;

public class TaskResponse {

    private Long taskId;
    private Long teamId;
    private Long assigneeId;
    private String assigneeName;
    private String title;
    private String description;
    private Task.Status status;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TaskResponse(Task task) {
        this.taskId = task.getTaskId();
        this.teamId = task.getTeam().getTeamId();

        if (task.getAssignee() != null) {
            this.assigneeId = task.getAssignee().getUserId();
            this.assigneeName = task.getAssignee().getName();
        }

        this.title = task.getTitle();
        this.description = task.getDescription();
        this.status = task.getStatus();
        this.dueDate = task.getDueDate();
        this.createdAt = task.getCreatedAt();
        this.updatedAt = task.getUpdatedAt();
    }

    public Long getTaskId() {
        return taskId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Task.Status getStatus() {
        return status;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}