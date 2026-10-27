package com.teammate.backend.user.controller;

import com.teammate.backend.user.dto.UserResponse;
import com.teammate.backend.user.service.UserService;
import com.teammate.backend.user.service.PasswordChangeService;
import com.teammate.backend.user.dto.PasswordCodeRequest;
import com.teammate.backend.user.dto.ChangePasswordRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final PasswordChangeService passwordChangeService;

    public UserController(UserService userService, PasswordChangeService passwordChangeService) {
        this.userService = userService;
        this.passwordChangeService = passwordChangeService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyInfo(Authentication authentication) {

        String loginId = authentication.getName();

        UserResponse response = userService.getMyInfo(loginId);

        return ResponseEntity.ok(response);
    }
    @PostMapping("/me/password/email/send")
    public ResponseEntity<String> sendPasswordCode(Authentication authentication) {
        passwordChangeService.sendCode(authentication.getName());
        return ResponseEntity.ok("인증번호를 발송했습니다.");
    }

    @PostMapping("/me/password/email/verify")
    public ResponseEntity<String> verifyPasswordCode(Authentication authentication,
                                                     @Valid @RequestBody PasswordCodeRequest request) {
        passwordChangeService.verifyCode(authentication.getName(), request.code());
        return ResponseEntity.ok("이메일 인증이 완료되었습니다.");
    }

    @PatchMapping("/me/password")
    public ResponseEntity<String> changePassword(Authentication authentication,
                                                 @Valid @RequestBody ChangePasswordRequest request) {
        passwordChangeService.changePassword(authentication.getName(), request.newPassword());
        return ResponseEntity.ok("비밀번호가 변경되었습니다. 다시 로그인해 주세요.");
    }
}