package com.vibeworks.planning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ImportMembersResponse {
    private int totalProcessed;
    private int successful;
    private int failed;
    private List<String> errors;
    private List<MemberResponse> importedMembers;
    
    public ImportMembersResponse(int totalProcessed, int successful, int failed, List<String> errors) {
        this.totalProcessed = totalProcessed;
        this.successful = successful;
        this.failed = failed;
        this.errors = errors;
    }
    
    public ImportMembersResponse(int totalProcessed, int successful, int failed, List<String> errors, List<MemberResponse> importedMembers) {
        this.totalProcessed = totalProcessed;
        this.successful = successful;
        this.failed = failed;
        this.errors = errors;
        this.importedMembers = importedMembers;
    }
}

