package com.vibeworks.tracking.repository;

import com.vibeworks.tracking.model.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskStatusRepository extends JpaRepository<TaskStatus, Long> {
    Optional<TaskStatus> findByTaskId(Long taskId);
    List<TaskStatus> findByEventId(Long eventId);
    List<TaskStatus> findByEventIdAndStatus(Long eventId, String status);
}

