package com.eventmanagement.api.dto.request;

import com.eventmanagement.model.enums.EventStatus;
import lombok.Data;

@Data
public class UpdateEventRequest {
    private String eventName;
    private String eventInfo;
    private String startDate;
    private String endDate;
    private String eventDate;
    private EventStatus status;
}

