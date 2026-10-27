package com.teammate.backend.team.dto;

import com.teammate.backend.team.entity.TeamMember;
import jakarta.validation.constraints.NotNull;

public class UpdateTeamMemberRoleRequest {

    @NotNull(message = "변경할 역할을 입력해주세요.")
    private TeamMember.TeamRole role;

    public TeamMember.TeamRole getRole() {
        return role;
    }

    public void setRole(TeamMember.TeamRole role) {
        this.role = role;
    }
}
