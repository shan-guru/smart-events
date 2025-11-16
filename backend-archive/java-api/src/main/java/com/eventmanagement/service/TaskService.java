package com.eventmanagement.service;

import com.eventmanagement.api.dto.request.GenerateTasksRequest;
import com.eventmanagement.api.dto.response.TaskResponse;
import com.eventmanagement.model.entity.Event;
import com.eventmanagement.model.entity.Task;
import com.eventmanagement.model.enums.Priority;
import com.eventmanagement.repository.EventRepository;
import com.eventmanagement.repository.TaskRepository;
import com.eventmanagement.util.exceptions.ResourceNotFoundException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final EventRepository eventRepository;
    private final LLMServiceClient llmServiceClient;
    private final ObjectMapper objectMapper;

    @Transactional
    public List<TaskResponse> generateTasksForEvent(Long eventId, GenerateTasksRequest request) {
        log.info("Generating tasks for event id: {}", eventId);
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event", eventId));
        
        // Call LLM service to generate tasks
        List<Map<String, Object>> generatedTasks = llmServiceClient.generateTasks(request)
                .block(); // Blocking call - in production, consider async
        
        // Save tasks to database
        List<Task> tasks = generatedTasks.stream()
                .map(taskData -> mapToTaskEntity(eventId, taskData))
                .collect(Collectors.toList());
        
        List<Task> savedTasks = taskRepository.saveAll(tasks);
        
        return savedTasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByEventId(Long eventId) {
        return taskRepository.findByEventIdOrderByOrderIndexAsc(eventId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTask(Long id) {
        log.info("Deleting task with id: {}", id);
        
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        
        taskRepository.delete(task);
    }

    @Transactional
    public void deleteTasksByEventId(Long eventId) {
        log.info("Deleting all tasks for event id: {}", eventId);
        taskRepository.deleteByEventId(eventId);
    }

    private Task mapToTaskEntity(Long eventId, Map<String, Object> taskData) {
        Task task = new Task();
        task.setEventId(eventId);
        task.setTaskTitle((String) taskData.get("task"));
        task.setDescription((String) taskData.get("description"));
        
        String priorityStr = ((String) taskData.getOrDefault("priority", "medium")).toUpperCase();
        task.setPriority(Priority.valueOf(priorityStr));
        
        Map<String, Object> duration = (Map<String, Object>) taskData.get("estimated_duration");
        if (duration != null) {
            Object quantity = duration.get("quantity");
            if (quantity != null) {
                task.setDurationQuantity(quantity instanceof Number 
                        ? ((Number) quantity).doubleValue() 
                        : Double.parseDouble(quantity.toString()));
            }
            task.setDurationUnit((String) duration.get("unit"));
        }
        
        // Store owners as JSON string
        Object owners = taskData.get("owners");
        if (owners != null) {
            try {
                task.setOwners(objectMapper.writeValueAsString(owners));
            } catch (JsonProcessingException e) {
                log.error("Error serializing owners", e);
            }
        }
        
        return task;
    }

    private TaskResponse mapToResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getEventId(),
                task.getTaskTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getDurationQuantity(),
                task.getDurationUnit(),
                task.getOwners(),
                task.getStartDateTime(),
                task.getEndDateTime(),
                task.getOrderIndex(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}

