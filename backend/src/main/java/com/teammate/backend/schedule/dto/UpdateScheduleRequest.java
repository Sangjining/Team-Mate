package com.teammate.backend.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class UpdateScheduleRequest {

    @NotBlank(message = "일정 제목은 필수입니다.")
    @Size(max = 100, message = "일정 제목은 100자 이하여야 합니다.")
    private String title;

    @Size(max = 1000, message = "일정 설명은 1000자 이하여야 합니다.")
    private String description;

    @NotNull(message = "시작 시간은 필수입니다.")
    private LocalDateTime startAt;

    private LocalDateTime endAt;

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
    }
}