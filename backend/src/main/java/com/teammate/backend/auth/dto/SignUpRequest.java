package com.teammate.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class SignUpRequest {

    @NotBlank(message = "아이디를 입력해주세요.")
    @Pattern(
            regexp = "^[a-z0-9]{4,20}$",
            message = "아이디는 영문 소문자와 숫자 4~20자로 입력해주세요."
    )
    private String loginId;

    @NotBlank(message = "이메일을 입력해주세요.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "비밀번호를 입력해주세요.")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[!@#$%^&*])[A-Za-z\\d!@#$%^&*]{8,20}$",
            message = "비밀번호는 영문, 숫자, 특수문자를 포함하여 8~20자로 입력해주세요."
    )
    private String password;

    @NotBlank(message = "이름을 입력해주세요.")
    @Pattern(
            regexp = "^[가-힣a-zA-Z]{2,20}$",
            message = "이름은 한글 또는 영문 2~20자로 입력해주세요."
    )
    private String name;

    public String getLoginId() {
        return loginId;
    }

    public void setLoginId(String loginId) {
        this.loginId = loginId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}