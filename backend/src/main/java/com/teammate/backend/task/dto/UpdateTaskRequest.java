package com.teammate.backend.task.dto;

import com.teammate.backend.task.entity.Task.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class UpdateTaskRequest {

    @NotBlank(message = "업무 제목은 필수입니다.")
    @Size(max = 100, message = "업무 제목은 100자 이하여야 합니다.")
    private String title;

    @Size(max = 1000, message = "업무 설명은 1000자 이하여야 합니다.")
    private String description;

    private Long assigneeId;

    private LocalDateTime dueDate;

    // 기존 클라이언트가 생략하면 현재 우선순위 유지
    private Priority priority;

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public Priority getPriority() {
        return priority;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }
}