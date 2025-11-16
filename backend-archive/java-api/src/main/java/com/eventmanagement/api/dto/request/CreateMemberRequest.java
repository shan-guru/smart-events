package com.eventmanagement.api.dto.request;

import com.eventmanagement.model.enums.MemberType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateMemberRequest {
    @NotNull(message = "Member type is required")
    private MemberType type;
    
    private String firstName;
    private String lastName;
    private String name;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    private String phone;
    private String whatsapp;
    private String specializedIn;
    private String experience;
    private String address;
    private Boolean offline = false;
}

