package com.eventmanagement.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class GenerateScheduleRequest {
    @NotBlank(message = "Event name is required")
    private String eventName;
    
    private String eventInfo;
    private String eventStartDate;
    private String eventEndDate;
    
    @NotEmpty(message = "Tasks are required")
    private List<Map<String, Object>> tasks;
    
    @NotEmpty(message = "Members are required")
    private List<Map<String, Object>> members;
}

