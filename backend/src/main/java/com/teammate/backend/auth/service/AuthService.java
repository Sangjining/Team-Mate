package com.teammate.backend.auth.service;

import com.teammate.backend.auth.dto.LoginRequest;
import com.teammate.backend.auth.dto.LoginResponse;
import com.teammate.backend.auth.dto.SignUpRequest;
import com.teammate.backend.config.JwtUtil;
import com.teammate.backend.email.service.EmailService;
import com.teammate.backend.user.entity.User;
import com.teammate.backend.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    private final Map<String, VerificationInfo> verificationCodes
            = new ConcurrentHashMap<>();

    private final Set<String> verifiedEmails
            = ConcurrentHashMap.newKeySet();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    // 회원가입
    public void signUp(SignUpRequest request) {

        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        if (!verifiedEmails.contains(request.getEmail())) {
            throw new IllegalArgumentException("이메일 인증이 필요합니다.");
        }

        User user = new User();

        user.setLoginId(request.getLoginId());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());

        userRepository.save(user);

        // 회원가입 완료 후 인증 상태 제거
        verifiedEmails.remove(request.getEmail());
        verificationCodes.remove(request.getEmail());
    }

    // 로그인
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "아이디 또는 비밀번호가 올바르지 않습니다."
                        )
                );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "아이디 또는 비밀번호가 올바르지 않습니다."
            );
        }

        String token = jwtUtil.generateToken(
                user.getUserId(),
                user.getLoginId(),
                user.getRole().name()
        );

        return new LoginResponse(
                user.getUserId(),
                user.getLoginId(),
                user.getName(),
                user.getProfileId(),
                user.getRole().name(),
                token
        );
    }

    // 이메일 인증번호 발송
    public void sendVerificationCode(String email) {

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        String verificationCode =
                String.valueOf(
                        (int) (Math.random() * 900000) + 100000
                );

        LocalDateTime expiresAt =
                LocalDateTime.now().plusMinutes(5);

        verificationCodes.put(
                email,
                new VerificationInfo(
                        verificationCode,
                        expiresAt
                )
        );

        // 재발송 시 이전 인증 완료 상태 제거
        verifiedEmails.remove(email);

        emailService.sendVerificationCode(
                email,
                verificationCode
        );
    }

    // 이메일 인증번호 확인
    public void verifyEmail(String email, String code) {

        VerificationInfo verificationInfo =
                verificationCodes.get(email);

        if (verificationInfo == null) {
            throw new IllegalArgumentException(
                    "인증번호를 먼저 발급받아야 합니다."
            );
        }

        if (LocalDateTime.now().isAfter(
                verificationInfo.expiresAt
        )) {
            verificationCodes.remove(email);

            throw new IllegalArgumentException(
                    "인증번호가 만료되었습니다."
            );
        }

        if (!verificationInfo.code.equals(code)) {
            throw new IllegalArgumentException(
                    "인증번호가 올바르지 않습니다."
            );
        }

        verifiedEmails.add(email);
        verificationCodes.remove(email);
    }

    private static class VerificationInfo {

        private final String code;
        private final LocalDateTime expiresAt;

        public VerificationInfo(
                String code,
                LocalDateTime expiresAt
        ) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }
}