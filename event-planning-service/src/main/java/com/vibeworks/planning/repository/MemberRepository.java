package com.vibeworks.planning.repository;

import com.vibeworks.planning.model.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    List<Member> findByType(String type);
    List<Member> findAllByOrderByCreatedAtDesc();
}

