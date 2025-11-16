package com.vibeworks.planning.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String eventName;
    
    @Column(columnDefinition = "TEXT")
    private String eventInfo;
    
    private String startDate;
    private String endDate;
    private String eventDate;
    
    @Column(columnDefinition = "TEXT")
    private String tasks; // JSON string
    
    @Column(columnDefinition = "TEXT")
    private String assignedMembers; // JSON string
    
    private Integer currentStep = 1;
    
    @Column(columnDefinition = "TEXT")
    private String completedSteps; // JSON string
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
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

