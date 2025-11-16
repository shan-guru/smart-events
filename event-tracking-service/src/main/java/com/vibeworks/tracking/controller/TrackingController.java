package com.vibeworks.tracking.controller;

import com.vibeworks.tracking.dto.*;
import com.vibeworks.tracking.service.TrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
@CrossOrigin(origins = "*")
public class TrackingController {
    
    @Autowired
    private TrackingService trackingService;
    
    @GetMapping("/events/{eventId}/status")
    public ResponseEntity<EventStatusResponse> getEventStatus(@PathVariable Long eventId) {
        EventStatusResponse response = trackingService.getEventStatus(eventId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/tasks/{taskId}/status")
    public ResponseEntity<TaskStatusResponse> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestParam Long eventId,
            @RequestBody TaskStatusUpdateRequest request) {
        TaskStatusResponse response = trackingService.updateTaskStatus(taskId, eventId, request);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/tasks/{taskId}/status")
    public ResponseEntity<TaskStatusResponse> getTaskStatus(@PathVariable Long taskId) {
        TaskStatusResponse response = trackingService.getTaskStatus(taskId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/events/{eventId}/progress")
    public ResponseEntity<EventStatusResponse> getEventProgress(@PathVariable Long eventId) {
        EventStatusResponse response = trackingService.getEventStatus(eventId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/my-tasks")
    public ResponseEntity<List<TaskStatusResponse>> getMyTasks(@RequestParam(required = false) Long userId) {
        List<TaskStatusResponse> responses = trackingService.getMyTasks(userId != null ? userId : 0L);
        return ResponseEntity.ok(responses);
    }
    
    @PostMapping("/tasks/{taskId}/complete")
    public ResponseEntity<TaskStatusResponse> completeTask(@PathVariable Long taskId) {
        TaskStatusResponse response = trackingService.completeTask(taskId);
        return ResponseEntity.ok(response);
    }
}

