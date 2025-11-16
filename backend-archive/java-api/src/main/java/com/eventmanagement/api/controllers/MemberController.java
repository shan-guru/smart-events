package com.eventmanagement.api.controllers;

import com.eventmanagement.api.dto.request.CreateMemberRequest;
import com.eventmanagement.api.dto.response.ApiResponse;
import com.eventmanagement.api.dto.response.MemberResponse;
import com.eventmanagement.model.enums.MemberType;
import com.eventmanagement.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping
    public ResponseEntity<ApiResponse<MemberResponse>> createMember(@Valid @RequestBody CreateMemberRequest request) {
        MemberResponse member = memberService.createMember(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Member created successfully", member));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MemberResponse>> getMemberById(@PathVariable Long id) {
        MemberResponse member = memberService.getMemberById(id);
        return ResponseEntity.ok(ApiResponse.success(member));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MemberResponse>>> getAllMembers(
            @RequestParam(required = false) MemberType type) {
        List<MemberResponse> members;
        if (type != null) {
            members = memberService.getMembersByType(type);
        } else {
            members = memberService.getAllMembers();
        }
        return ResponseEntity.ok(ApiResponse.success(members));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteMember(@PathVariable Long id) {
        memberService.deleteMember(id);
        return ResponseEntity.ok(ApiResponse.success("Member deleted successfully", null));
    }
}

