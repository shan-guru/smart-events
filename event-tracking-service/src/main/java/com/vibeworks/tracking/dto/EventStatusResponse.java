package com.vibeworks.tracking.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventStatusResponse {
    private Long eventId;
    private String status; // planning, active, completed, cancelled
    private Integer totalTasks;
    private Integer completedTasks;
    private Integer inProgressTasks;
    private Integer pendingTasks;
    private Integer blockedTasks;
    private Double progressPercentage;
    private LocalDateTime lastUpdated;
}

