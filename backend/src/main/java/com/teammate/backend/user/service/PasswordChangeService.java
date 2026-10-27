package com.teammate.backend.user.service;

import com.teammate.backend.email.service.EmailService;
import com.teammate.backend.user.entity.User;
import com.teammate.backend.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PasswordChangeService {
    private static final Duration CODE_LIFETIME = Duration.ofMinutes(5);
    private static final Duration RESEND_DELAY = Duration.ofSeconds(60);
    private static final Duration VERIFIED_LIFETIME = Duration.ofMinutes(5);
    private static final int MAX_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, Challenge> challenges = new ConcurrentHashMap<>();

    public PasswordChangeService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                                 EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public synchronized void sendCode(String loginId) {
        User user = getUser(loginId);
        Instant now = Instant.now();
        Challenge previous = challenges.get(loginId);
        if (previous != null && now.isBefore(previous.sentAt.plus(RESEND_DELAY))) {
            throw new IllegalArgumentException("인증번호는 60초 후 다시 발송할 수 있습니다.");
        }
        String code = String.format("%06d", random.nextInt(1_000_000));
        // 발송이 성공한 경우에만 이전 인증 상태를 대체합니다.
        emailService.sendPasswordChangeCode(user.getEmail(), code);
        challenges.put(loginId, new Challenge(code, now, now.plus(CODE_LIFETIME)));
    }

    public synchronized void verifyCode(String loginId, String code) {
        Challenge challenge = challenges.get(loginId);
        if (challenge == null) throw new IllegalArgumentException("인증번호를 먼저 발급받아야 합니다.");
        if (Instant.now().isAfter(challenge.expiresAt)) {
            challenges.remove(loginId);
            throw new IllegalArgumentException("인증번호가 만료되었습니다.");
        }
        if (challenge.verifiedAt != null) throw new IllegalArgumentException("이미 인증되었습니다.");
        if (++challenge.attempts > MAX_ATTEMPTS) {
            challenges.remove(loginId);
            throw new IllegalArgumentException("인증 시도 횟수를 초과했습니다. 인증번호를 다시 발급받아 주세요.");
        }
        if (!challenge.code.equals(code)) {
            if (challenge.attempts >= MAX_ATTEMPTS) challenges.remove(loginId);
            throw new IllegalArgumentException("인증번호가 올바르지 않습니다.");
        }
        challenge.verifiedAt = Instant.now();
    }

    @Transactional
    public synchronized void changePassword(String loginId, String newPassword) {
        Challenge challenge = challenges.get(loginId);
        if (challenge == null || challenge.verifiedAt == null
                || Instant.now().isAfter(challenge.verifiedAt.plus(VERIFIED_LIFETIME))) {
            throw new IllegalArgumentException("이메일 인증을 다시 진행해 주세요.");
        }
        if (newPassword == null || newPassword.length() < 8 || newPassword.length() > 72) {
            throw new IllegalArgumentException("비밀번호는 8~72자로 입력해 주세요.");
        }
        User user = getUser(loginId);
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("기존 비밀번호와 다른 비밀번호를 입력해 주세요.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.saveAndFlush(user);
        challenges.remove(loginId);
    }

    private User getUser(String loginId) {
        return userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private static final class Challenge {
        final String code;
        final Instant sentAt;
        final Instant expiresAt;
        int attempts = 0;
        Instant verifiedAt;
        Challenge(String code, Instant sentAt, Instant expiresAt) {
            this.code = code;
            this.sentAt = sentAt;
            this.expiresAt = expiresAt;
        }
    }
}
