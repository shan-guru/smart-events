package com.vibeworks.planning.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMemberRequest {
    @NotNull(message = "Member type is required")
    private String type; // "person" or "entity"
    
    private String firstName; // For person type
    private String lastName; // For person type
    private String name; // For entity type
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    private String phone;
    private String whatsapp;
    private String specializedIn;
    private String experience;
    private String address;
    private Boolean offline = false; // For entity type
}

