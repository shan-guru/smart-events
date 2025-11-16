package com.vibeworks.planning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {
    private Long id;
    private String type;
    private String firstName;
    private String lastName;
    private String name;
    private String email;
    private String phone;
    private String whatsapp;
    private String specializedIn;
    private String experience;
    private String address;
    private Boolean offline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

