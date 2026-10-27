package com.teammate.backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record PasswordCodeRequest(
    @NotBlank @Pattern(regexp = "[0-9]{6}", message = "인증번호는 6자리 숫자여야 합니다.") String code
) {}
