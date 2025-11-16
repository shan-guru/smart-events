package com.eventmanagement.repository;

import com.eventmanagement.model.entity.Task;
import com.eventmanagement.model.enums.Priority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByEventId(Long eventId);
    List<Task> findByEventIdOrderByOrderIndexAsc(Long eventId);
    List<Task> findByEventIdAndPriority(Long eventId, Priority priority);
    void deleteByEventId(Long eventId);
}

