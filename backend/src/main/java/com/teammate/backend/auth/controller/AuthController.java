package com.teammate.backend.auth.controller;

import com.teammate.backend.auth.dto.LoginRequest;
import com.teammate.backend.auth.dto.SignUpRequest;
import com.teammate.backend.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.teammate.backend.auth.dto.LoginResponse;
import com.teammate.backend.auth.dto.EmailVerificationRequest;
import com.teammate.backend.auth.dto.VerifyEmailRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<String> signUp(@RequestBody SignUpRequest request) {

        authService.signUp(request);

        return ResponseEntity.ok("회원가입이 완료되었습니다.");
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }
    @PostMapping("/email/send")
    public ResponseEntity<String> sendVerificationCode(
            @RequestBody EmailVerificationRequest request
    ) {
        authService.sendVerificationCode(request.getEmail());

        return ResponseEntity.ok("인증번호가 발송되었습니다.");
    }
    @PostMapping("/email/verify")
    public ResponseEntity<String> verifyEmail(
            @RequestBody VerifyEmailRequest request
    ) {
        authService.verifyEmail(
                request.getEmail(),
                request.getCode()
        );

        return ResponseEntity.ok("이메일 인증이 완료되었습니다.");
    }
}