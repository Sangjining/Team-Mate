package com.teammate.backend.notification.repository;

import com.teammate.backend.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 로그인한 사용자에게 도착한 알림을 최신순으로 조회
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long recipientId);

    // 다른 사용자의 알림을 삭제하지 못하도록 수신자 ID까지 확인
    Optional<Notification> findByNotificationIdAndRecipientUserId(Long notificationId, Long recipientId);

    // 상단 종 아이콘에 표시할 알림 수
    long countByRecipientUserId(Long recipientId);
}
