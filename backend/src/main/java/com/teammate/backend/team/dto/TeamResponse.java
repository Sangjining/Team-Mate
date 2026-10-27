package com.teammate.backend.team.dto;

import com.teammate.backend.team.entity.Team;
import java.time.LocalDateTime;

public class TeamResponse {

    private Long teamId;
    private String name;
    private String description;
    private Team.Status status;
    private LocalDateTime createdAt;

    // 최초 팀 생성자의 사용자 ID
    private Long createdByUserId;

    public TeamResponse(Team team) {
        this.teamId = team.getTeamId();
        this.name = team.getName();
        this.description = team.getDescription();
        this.status = team.getStatus();
        this.createdAt = team.getCreatedAt();

        this.createdByUserId = team.getCreatedBy() != null
                ? team.getCreatedBy().getUserId()
                : null;
    }

    public Long getTeamId() {
        return teamId;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Team.Status getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getCreatedByUserId() {
        return createdByUserId;
    }
}