package com.eventmanagement.service;

import com.eventmanagement.api.dto.request.CreateMemberRequest;
import com.eventmanagement.api.dto.response.MemberResponse;
import com.eventmanagement.model.entity.Member;
import com.eventmanagement.model.enums.MemberType;
import com.eventmanagement.repository.MemberRepository;
import com.eventmanagement.util.exceptions.ResourceAlreadyExistsException;
import com.eventmanagement.util.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MemberService {

    private final MemberRepository memberRepository;

    @Transactional
    public MemberResponse createMember(CreateMemberRequest request) {
        log.info("Creating member: {}", request.getEmail());
        
        // Check if member with same email exists
        memberRepository.findByEmail(request.getEmail())
                .ifPresent(existing -> {
                    throw new ResourceAlreadyExistsException(
                            "Member with email '" + request.getEmail() + "' already exists");
                });
        
        Member member = new Member();
        member.setType(request.getType());
        
        if (request.getType() == MemberType.PERSON) {
            member.setFirstName(request.getFirstName());
            member.setLastName(request.getLastName());
        } else {
            member.setName(request.getName());
            member.setOffline(request.getOffline() != null ? request.getOffline() : false);
        }
        
        member.setEmail(request.getEmail());
        member.setPhone(request.getPhone());
        member.setWhatsapp(request.getWhatsapp());
        member.setSpecializedIn(request.getSpecializedIn());
        member.setExperience(request.getExperience());
        member.setAddress(request.getAddress());
        
        Member savedMember = memberRepository.save(member);
        return mapToResponse(savedMember);
    }

    @Transactional(readOnly = true)
    public MemberResponse getMemberById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member", id));
        return mapToResponse(member);
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getAllMembers() {
        return memberRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getMembersByType(MemberType type) {
        return memberRepository.findByType(type).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteMember(Long id) {
        log.info("Deleting member with id: {}", id);
        
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member", id));
        
        memberRepository.delete(member);
    }

    private MemberResponse mapToResponse(Member member) {
        return new MemberResponse(
                member.getId(),
                member.getType(),
                member.getFirstName(),
                member.getLastName(),
                member.getName(),
                member.getEmail(),
                member.getPhone(),
                member.getWhatsapp(),
                member.getSpecializedIn(),
                member.getExperience(),
                member.getAddress(),
                member.getOffline(),
                member.getCreatedAt(),
                member.getUpdatedAt()
        );
    }
}

