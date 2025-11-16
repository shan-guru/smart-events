package com.eventmanagement.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateEventRequest {
    @NotBlank(message = "Event name is required")
    private String eventName;
    
    private String eventInfo;
    private String startDate;
    private String endDate;
    private String eventDate;
}

