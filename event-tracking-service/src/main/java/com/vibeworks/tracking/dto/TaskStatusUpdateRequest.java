package com.vibeworks.tracking.dto;

import lombok.Data;

@Data
public class TaskStatusUpdateRequest {
    private String status; // pending, in-progress, completed, blocked
    private String notes;
}

