package com.vibeworks.tracking.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskStatusResponse {
    private Long id;
    private Long taskId;
    private Long eventId;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

