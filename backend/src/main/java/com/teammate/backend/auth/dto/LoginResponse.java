package com.teammate.backend.auth.dto;

public class LoginResponse {

    private Long userId;
    private String loginId;
    private String name;
    private Integer profileId;
    private String role;
    private String token;

    public LoginResponse(Long userId, String loginId, String name,
                         Integer profileId, String role, String token) {
        this.userId = userId;
        this.loginId = loginId;
        this.name = name;
        this.profileId = profileId;
        this.role = role;
        this.token = token;
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

    public Integer getProfileId() {
        return profileId;
    }

    public String getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }
}