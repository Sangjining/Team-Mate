package com.teammate.backend.user.service;

import com.teammate.backend.user.dto.UserResponse;
import com.teammate.backend.user.entity.User;
import com.teammate.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getMyInfo(String loginId) {

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다.")
                );

        return new UserResponse(
                user.getUserId(),
                user.getLoginId(),
                user.getEmail(),
                user.getName(),
                user.getProfileId(),
                user.getRole().name()
        );
    }
}