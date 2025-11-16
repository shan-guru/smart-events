package com.vibeworks.tracking.service;

import com.vibeworks.tracking.dto.*;
import com.vibeworks.tracking.model.EventProgress;
import com.vibeworks.tracking.model.TaskStatus;
import com.vibeworks.tracking.repository.EventProgressRepository;
import com.vibeworks.tracking.repository.TaskStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class TrackingService {
    
    @Autowired
    private TaskStatusRepository taskStatusRepository;
    
    @Autowired
    private EventProgressRepository eventProgressRepository;
    
    @Transactional
    public TaskStatusResponse updateTaskStatus(Long taskId, Long eventId, TaskStatusUpdateRequest request) {
        Optional<TaskStatus> existing = taskStatusRepository.findByTaskId(taskId);
        
        TaskStatus taskStatus;
        if (existing.isPresent()) {
            taskStatus = existing.get();
            taskStatus.setStatus(request.getStatus());
            taskStatus.setNotes(request.getNotes());
        } else {
            taskStatus = new TaskStatus();
            taskStatus.setTaskId(taskId);
            taskStatus.setEventId(eventId);
            taskStatus.setStatus(request.getStatus());
            taskStatus.setNotes(request.getNotes());
        }
        
        taskStatus = taskStatusRepository.save(taskStatus);
        updateEventProgress(eventId);
        
        return convertToResponse(taskStatus);
    }
    
    public TaskStatusResponse getTaskStatus(Long taskId) {
        TaskStatus taskStatus = taskStatusRepository.findByTaskId(taskId)
                .orElseThrow(() -> new RuntimeException("Task status not found"));
        return convertToResponse(taskStatus);
    }
    
    public EventStatusResponse getEventStatus(Long eventId) {
        EventProgress progress = eventProgressRepository.findByEventId(eventId)
                .orElseGet(() -> {
                    EventProgress newProgress = new EventProgress();
                    newProgress.setEventId(eventId);
                    newProgress.setTotalTasks(0);
                    newProgress.setCompletedTasks(0);
                    newProgress.setInProgressTasks(0);
                    newProgress.setPendingTasks(0);
                    newProgress.setBlockedTasks(0);
                    newProgress.setProgressPercentage(0.0);
                    return eventProgressRepository.save(newProgress);
                });
        
        EventStatusResponse response = new EventStatusResponse();
        response.setEventId(eventId);
        response.setTotalTasks(progress.getTotalTasks());
        response.setCompletedTasks(progress.getCompletedTasks());
        response.setInProgressTasks(progress.getInProgressTasks());
        response.setPendingTasks(progress.getPendingTasks());
        response.setBlockedTasks(progress.getBlockedTasks());
        response.setProgressPercentage(progress.getProgressPercentage());
        response.setLastUpdated(progress.getUpdatedAt());
        
        // Determine overall event status
        if (progress.getProgressPercentage() == 100.0) {
            response.setStatus("completed");
        } else if (progress.getInProgressTasks() > 0 || progress.getCompletedTasks() > 0) {
            response.setStatus("active");
        } else {
            response.setStatus("planning");
        }
        
        return response;
    }
    
    public List<TaskStatusResponse> getMyTasks(Long userId) {
        // For now, return all tasks. In production, filter by userId
        return taskStatusRepository.findAll().stream()
                .map(this::convertToResponse)
                .toList();
    }
    
    @Transactional
    public TaskStatusResponse completeTask(Long taskId) {
        Optional<TaskStatus> existing = taskStatusRepository.findByTaskId(taskId);
        
        TaskStatus taskStatus;
        if (existing.isPresent()) {
            taskStatus = existing.get();
        } else {
            throw new RuntimeException("Task status not found");
        }
        
        taskStatus.setStatus("completed");
        taskStatus = taskStatusRepository.save(taskStatus);
        updateEventProgress(taskStatus.getEventId());
        
        return convertToResponse(taskStatus);
    }
    
    @Transactional
    private void updateEventProgress(Long eventId) {
        List<TaskStatus> allTasks = taskStatusRepository.findByEventId(eventId);
        
        int total = allTasks.size();
        int completed = (int) allTasks.stream().filter(t -> "completed".equals(t.getStatus())).count();
        int inProgress = (int) allTasks.stream().filter(t -> "in-progress".equals(t.getStatus())).count();
        int pending = (int) allTasks.stream().filter(t -> "pending".equals(t.getStatus())).count();
        int blocked = (int) allTasks.stream().filter(t -> "blocked".equals(t.getStatus())).count();
        
        double progressPercentage = total > 0 ? (completed * 100.0 / total) : 0.0;
        
        Optional<EventProgress> existing = eventProgressRepository.findByEventId(eventId);
        EventProgress progress;
        if (existing.isPresent()) {
            progress = existing.get();
        } else {
            progress = new EventProgress();
            progress.setEventId(eventId);
        }
        
        progress.setTotalTasks(total);
        progress.setCompletedTasks(completed);
        progress.setInProgressTasks(inProgress);
        progress.setPendingTasks(pending);
        progress.setBlockedTasks(blocked);
        progress.setProgressPercentage(progressPercentage);
        
        eventProgressRepository.save(progress);
    }
    
    private TaskStatusResponse convertToResponse(TaskStatus taskStatus) {
        TaskStatusResponse response = new TaskStatusResponse();
        response.setId(taskStatus.getId());
        response.setTaskId(taskStatus.getTaskId());
        response.setEventId(taskStatus.getEventId());
        response.setStatus(taskStatus.getStatus());
        response.setNotes(taskStatus.getNotes());
        response.setCreatedAt(taskStatus.getCreatedAt());
        response.setUpdatedAt(taskStatus.getUpdatedAt());
        return response;
    }
}

