package com.vibeworks.planning.controller;

import com.vibeworks.planning.dto.CreateMemberRequest;
import com.vibeworks.planning.dto.ImportMembersResponse;
import com.vibeworks.planning.dto.MemberResponse;
import com.vibeworks.planning.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
@Tag(name = "Members", description = "Core members management API")
public class MemberController {
    
    @Autowired
    private MemberService memberService;
    
    @PostMapping
    @Operation(summary = "Create a new member")
    public ResponseEntity<MemberResponse> createMember(@Valid @RequestBody CreateMemberRequest request) {
        MemberResponse member = memberService.createMember(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }
    
    @PostMapping("/import")
    @Operation(summary = "Import members from file (JSON, CSV, or Excel)")
    public ResponseEntity<ImportMembersResponse> importMembers(
            @RequestParam("file") MultipartFile file) {
        ImportMembersResponse response = memberService.importMembers(file);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    @Operation(summary = "Get all members")
    public ResponseEntity<List<MemberResponse>> getAllMembers(
            @RequestParam(required = false) String type) {
        List<MemberResponse> members = memberService.getAllMembers();
        
        if (type != null && !type.isEmpty()) {
            members = members.stream()
                    .filter(m -> m.getType().equalsIgnoreCase(type))
                    .toList();
        }
        
        return ResponseEntity.ok(members);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get member by ID")
    public ResponseEntity<MemberResponse> getMemberById(@PathVariable Long id) {
        MemberResponse member = memberService.getMemberById(id);
        return ResponseEntity.ok(member);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update member by ID")
    public ResponseEntity<MemberResponse> updateMember(
            @PathVariable Long id,
            @Valid @RequestBody CreateMemberRequest request) {
        MemberResponse member = memberService.updateMember(id, request);
        return ResponseEntity.ok(member);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete member by ID")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.noContent().build();
    }
}

