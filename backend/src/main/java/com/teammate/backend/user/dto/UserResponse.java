package com.teammate.backend.user.dto;

public class UserResponse {

    private Long userId;
    private String loginId;
    private String email;
    private String name;
    private Integer profileId;
    private String role;

    public UserResponse(Long userId, String loginId, String email,
                        String name, Integer profileId, String role) {
        this.userId = userId;
        this.loginId = loginId;
        this.email = email;
        this.name = name;
        this.profileId = profileId;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public String getLoginId() {
        return loginId;
    }

    public String getEmail() {
        return email;
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
}