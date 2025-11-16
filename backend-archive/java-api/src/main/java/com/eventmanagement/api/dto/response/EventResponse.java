package com.eventmanagement.api.dto.response;

import com.eventmanagement.model.enums.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private Long id;
    private String eventName;
    private String eventInfo;
    private String startDate;
    private String endDate;
    private String eventDate;
    private EventStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

