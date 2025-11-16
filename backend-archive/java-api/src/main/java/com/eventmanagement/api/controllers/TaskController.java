package com.eventmanagement.api.controllers;

import com.eventmanagement.api.dto.request.GenerateTasksRequest;
import com.eventmanagement.api.dto.response.ApiResponse;
import com.eventmanagement.api.dto.response.TaskResponse;
import com.eventmanagement.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events/{eventId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<List<TaskResponse>>> generateTasks(
            @PathVariable Long eventId,
            @Valid @RequestBody GenerateTasksRequest request) {
        List<TaskResponse> tasks = taskService.generateTasksForEvent(eventId, request);
        return ResponseEntity.ok(ApiResponse.success("Tasks generated successfully", tasks));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskResponse>>> getTasksByEventId(@PathVariable Long eventId) {
        List<TaskResponse> tasks = taskService.getTasksByEventId(eventId);
        return ResponseEntity.ok(ApiResponse.success(tasks));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully", null));
    }
}

