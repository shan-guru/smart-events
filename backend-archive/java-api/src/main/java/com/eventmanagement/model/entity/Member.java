package com.eventmanagement.model.entity;

import com.eventmanagement.model.enums.MemberType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "members")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberType type;

    // For PERSON type
    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    // For ENTITY type
    @Column(name = "name")
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    private String whatsapp;

    @Column(name = "specialized_in")
    private String specializedIn;

    private String experience;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "offline")
    private Boolean offline = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

