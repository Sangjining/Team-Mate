package com.teammate.backend.task.dto;

import com.teammate.backend.task.entity.Task;
import jakarta.validation.constraints.NotNull;

public class UpdateTaskStatusRequest {

    @NotNull(message = "업무 상태는 필수입니다.")
    private Task.Status status;

    public Task.Status getStatus() {
        return status;
    }
}