package com.teammate.backend.task.repository;

import com.teammate.backend.task.entity.TaskAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {

    // 동일 업무에 대한 사용자의 승인 대기 신청 조회
    Optional<TaskAssignment> findByTaskTaskIdAndUserUserIdAndStatus(
            Long taskId, Long userId, TaskAssignment.Status status
    );

    // 업무별 신청 목록 (OWNER 승인/거절 화면)
    List<TaskAssignment> findByTaskTaskIdOrderByCreatedAtDesc(Long taskId);

    // 팀 전체 승인 대기 신청 목록
    List<TaskAssignment> findByTaskTeamTeamIdAndStatusOrderByCreatedAtAsc(
            Long teamId, TaskAssignment.Status status
    );

    // 승인 시 같은 업무의 다른 대기 신청 처리에 사용
    List<TaskAssignment> findByTaskTaskIdAndStatus(
            Long taskId, TaskAssignment.Status status
    );

    // 업무 삭제 시 관련 신청 내역 정리
    void deleteByTaskTaskId(Long taskId);
}
