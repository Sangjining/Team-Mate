package com.teammate.backend.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    @NotBlank @Size(min = 8, max = 72, message = "비밀번호는 8~72자로 입력해 주세요.") String newPassword
) {}
