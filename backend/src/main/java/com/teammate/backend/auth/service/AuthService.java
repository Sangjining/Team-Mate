package com.teammate.backend.auth.service;

import com.teammate.backend.auth.dto.LoginRequest;
import com.teammate.backend.auth.dto.SignUpRequest;
import com.teammate.backend.user.entity.User;
import com.teammate.backend.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.teammate.backend.auth.dto.LoginResponse;
import com.teammate.backend.config.JwtUtil;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // 회원가입
    public void signUp(SignUpRequest request) {

        if (userRepository.existsByLoginId(request.getLoginId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = new User();

        user.setLoginId(request.getLoginId());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());

        userRepository.save(user);
    }

    // 로그인
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() ->
                        new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.")
                );

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
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
}