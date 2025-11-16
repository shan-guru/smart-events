package com.eventmanagement.api.dto.response;

import com.eventmanagement.model.enums.Priority;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private Long eventId;
    private String taskTitle;
    private String description;
    private Priority priority;
    private Double durationQuantity;
    private String durationUnit;
    private String owners; // JSON string
    private String startDateTime;
    private String endDateTime;
    private Integer orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

