package com.eventmanagement.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GenerateTasksRequest {
    @NotBlank(message = "Event name is required")
    private String event;
    
    @NotBlank(message = "Event information is required")
    private String eventInfo;
}

