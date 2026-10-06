package com.teammate.backend.schedule.dto;

import com.teammate.backend.schedule.entity.Schedule;

import java.time.LocalDateTime;

public class ScheduleResponse {

    private Long scheduleId;
    private Long teamId;
    private Long createdById;
    private String createdByName;
    private String title;
    private String description;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ScheduleResponse(Schedule schedule) {
        this.scheduleId = schedule.getScheduleId();
        this.teamId = schedule.getTeam().getTeamId();
        this.createdById = schedule.getCreatedBy().getUserId();
        this.createdByName = schedule.getCreatedBy().getName();
        this.title = schedule.getTitle();
        this.description = schedule.getDescription();
        this.startAt = schedule.getStartAt();
        this.endAt = schedule.getEndAt();
        this.createdAt = schedule.getCreatedAt();
        this.updatedAt = schedule.getUpdatedAt();
    }

    public Long getScheduleId() {
        return scheduleId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}