package com.teammate.backend.task.repository;

import com.teammate.backend.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByTeamTeamId(Long teamId);

    long countByTeamTeamId(Long teamId);

    long countByTeamTeamIdAndStatus(
            Long teamId,
            Task.Status status
    );
}