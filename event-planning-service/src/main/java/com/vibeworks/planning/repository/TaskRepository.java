package com.vibeworks.planning.repository;

import com.vibeworks.planning.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByEventId(Long eventId);
    void deleteByEventId(Long eventId);
}

