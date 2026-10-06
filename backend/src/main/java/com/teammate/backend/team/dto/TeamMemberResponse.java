package com.teammate.backend.team.dto;

import com.teammate.backend.team.entity.TeamMember;

public class TeamMemberResponse {

    private Long userId;
    private String loginId;
    private String name;
    private TeamMember.TeamRole role;

    public TeamMemberResponse(TeamMember teamMember) {
        this.userId = teamMember.getUser().getUserId();
        this.loginId = teamMember.getUser().getLoginId();
        this.name = teamMember.getUser().getName();
        this.role = teamMember.getRole();
    }

    public Long getUserId() {
        return userId;
    }

    public String getLoginId() {
        return loginId;
    }

    public String getName() {
        return name;
    }

    public TeamMember.TeamRole getRole() {
        return role;
    }
}