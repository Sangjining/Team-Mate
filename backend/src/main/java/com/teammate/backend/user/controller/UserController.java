package com.teammate.backend.user.controller;

import com.teammate.backend.user.dto.UserResponse;
import com.teammate.backend.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyInfo(Authentication authentication) {

        String loginId = authentication.getName();

        UserResponse response = userService.getMyInfo(loginId);

        return ResponseEntity.ok(response);
    }
}