package com.vibeworks.planning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportEventsResponse {
    private int totalProcessed;
    private int successful;
    private int failed;
    private List<String> errors;
    private List<WizardDataResponse> importedEvents;
    
    // Constructor without importedEvents for cases where we don't need to return them
    public ImportEventsResponse(int totalProcessed, int successful, int failed, List<String> errors) {
        this.totalProcessed = totalProcessed;
        this.successful = successful;
        this.failed = failed;
        this.errors = errors;
        this.importedEvents = List.of();
    }
}

