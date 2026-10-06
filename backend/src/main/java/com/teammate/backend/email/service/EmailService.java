package com.teammate.backend.email.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationCode(String email, String verificationCode) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("[Team-Mate] 이메일 인증번호");
        message.setText(
                "Team-Mate 회원가입 이메일 인증번호입니다.\n\n" +
                        "인증번호: " + verificationCode + "\n\n" +
                        "인증번호는 5분 동안 유효합니다."
        );

        mailSender.send(message);
    }
}