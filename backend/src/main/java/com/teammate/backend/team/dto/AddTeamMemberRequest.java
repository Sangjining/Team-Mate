package com.teammate.backend.team.dto;

import jakarta.validation.constraints.NotBlank;

public class AddTeamMemberRequest {

    @NotBlank(message = "사용자 아이디는 필수입니다.")
    private String loginId;

    public String getLoginId() {
        return loginId;
    }
}