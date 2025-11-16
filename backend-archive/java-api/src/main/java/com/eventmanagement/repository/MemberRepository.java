package com.eventmanagement.repository;

import com.eventmanagement.model.entity.Member;
import com.eventmanagement.model.enums.MemberType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    List<Member> findByType(MemberType type);
    List<Member> findBySpecializedInContainingIgnoreCase(String specialization);
    List<Member> findAllByOrderByCreatedAtDesc();
}

