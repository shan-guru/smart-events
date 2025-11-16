package com.vibeworks.planning.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vibeworks.planning.dto.CreateMemberRequest;
import com.vibeworks.planning.dto.ImportMembersResponse;
import com.vibeworks.planning.dto.MemberResponse;
import com.vibeworks.planning.model.Member;
import com.vibeworks.planning.repository.MemberRepository;
import com.vibeworks.planning.util.exceptions.ResourceAlreadyExistsException;
import com.vibeworks.planning.util.exceptions.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MemberService {
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Transactional
    public MemberResponse createMember(CreateMemberRequest request) {
        log.info("Creating member: {}", request.getEmail());
        
        // Check for duplicate email
        memberRepository.findByEmail(request.getEmail())
                .ifPresent(existing -> {
                    throw new ResourceAlreadyExistsException("Member with email '" + request.getEmail() + "' already exists");
                });
        
        Member member = mapToEntity(request);
        Member saved = memberRepository.save(member);
        return mapToResponse(saved);
    }
    
    @Transactional(readOnly = true)
    public List<MemberResponse> getAllMembers() {
        return memberRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public MemberResponse getMemberById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member", id));
        return mapToResponse(member);
    }
    
    @Transactional
    public MemberResponse updateMember(Long id, CreateMemberRequest request) {
        log.info("Updating member with id: {}", id);
        
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member", id));
        
        // Check for duplicate email (if email is being changed)
        if (!member.getEmail().equals(request.getEmail())) {
            memberRepository.findByEmail(request.getEmail())
                    .ifPresent(existing -> {
                        throw new ResourceAlreadyExistsException(
                            "Member with email '" + request.getEmail() + "' already exists");
                    });
        }
        
        // Update member fields
        member.setType(request.getType());
        if ("person".equals(request.getType())) {
            member.setFirstName(request.getFirstName());
            member.setLastName(request.getLastName());
            member.setName(null);
        } else {
            member.setName(request.getName());
            member.setOffline(request.getOffline() != null ? request.getOffline() : false);
            member.setFirstName(null);
            member.setLastName(null);
        }
        
        member.setEmail(request.getEmail());
        member.setPhone(request.getPhone());
        member.setWhatsapp(request.getWhatsapp());
        member.setSpecializedIn(request.getSpecializedIn());
        member.setExperience(request.getExperience());
        member.setAddress(request.getAddress());
        
        Member updated = memberRepository.save(member);
        return mapToResponse(updated);
    }
    
    @Transactional
    public void deleteMember(Long id) {
        log.info("Deleting member with id: {}", id);
        memberRepository.deleteById(id);
    }
    
    @Transactional
    public ImportMembersResponse importMembers(MultipartFile file) {
        log.info("Importing members from file: {}", file.getOriginalFilename());
        
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new RuntimeException("File name is required");
        }
        
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        
        try {
            List<Map<String, Object>> membersData;
            
            switch (extension) {
                case "json":
                    membersData = parseJsonFile(file);
                    break;
                case "csv":
                    membersData = parseCsvFile(file);
                    break;
                case "xlsx":
                case "xls":
                    membersData = parseExcelFile(file, extension);
                    break;
                default:
                    throw new RuntimeException("Unsupported file format: " + extension + ". Supported formats: JSON, CSV, Excel");
            }
            
            return processImport(membersData);
            
        } catch (Exception e) {
            log.error("Error importing members", e);
            throw new RuntimeException("Failed to import members: " + e.getMessage(), e);
        }
    }
    
    private List<Map<String, Object>> parseJsonFile(MultipartFile file) throws Exception {
        String content = new String(file.getBytes(), StandardCharsets.UTF_8);
        return objectMapper.readValue(content, new TypeReference<List<Map<String, Object>>>() {});
    }
    
    private List<Map<String, Object>> parseCsvFile(MultipartFile file) throws Exception {
        List<Map<String, Object>> members = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new RuntimeException("CSV file is empty");
            }
            
            String[] headers = parseCsvLine(headerLine);
            
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                
                String[] values = parseCsvLine(line);
                Map<String, Object> member = new HashMap<>();
                
                for (int i = 0; i < headers.length && i < values.length; i++) {
                    String header = headers[i].trim();
                    String value = values[i].trim();
                    
                    // Map various header formats
                    String normalizedHeader = normalizeHeader(header);
                    if (!normalizedHeader.isEmpty() && !value.isEmpty()) {
                        member.put(normalizedHeader, value);
                    }
                }
                
                if (!member.isEmpty()) {
                    members.add(member);
                }
            }
        }
        
        return members;
    }
    
    private String[] parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                values.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        values.add(current.toString());
        
        return values.toArray(new String[0]);
    }
    
    private String normalizeHeader(String header) {
        String lower = header.toLowerCase().trim();
        
        // Map various header name formats
        if (lower.contains("type") || lower.equals("membertype")) return "type";
        if (lower.contains("first") && lower.contains("name")) return "firstName";
        if (lower.contains("last") && lower.contains("name")) return "lastName";
        if (lower.equals("name") || lower.contains("entityname")) return "name";
        if (lower.contains("email")) return "email";
        if (lower.contains("phone") && !lower.contains("whatsapp")) return "phone";
        if (lower.contains("whatsapp") || lower.contains("whats app")) return "whatsapp";
        if (lower.contains("specialized") || lower.contains("specialization")) return "specializedIn";
        if (lower.contains("experience")) return "experience";
        if (lower.contains("address")) return "address";
        if (lower.contains("offline") || lower.contains("isoffline")) return "offline";
        
        return "";
    }
    
    private List<Map<String, Object>> parseExcelFile(MultipartFile file, String extension) throws Exception {
        List<Map<String, Object>> members = new ArrayList<>();
        
        try (InputStream is = file.getInputStream();
             Workbook workbook = extension.equals("xlsx") 
                 ? new XSSFWorkbook(is) 
                 : new HSSFWorkbook(is)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet.getPhysicalNumberOfRows() < 2) {
                throw new RuntimeException("Excel file must have at least a header row and one data row");
            }
            
            Row headerRow = sheet.getRow(0);
            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(getCellValueAsString(cell));
            }
            
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                Map<String, Object> member = new HashMap<>();
                boolean hasData = false;
                
                for (int j = 0; j < headers.size() && j < row.getLastCellNum(); j++) {
                    Cell cell = row.getCell(j);
                    String header = headers.get(j);
                    String value = getCellValueAsString(cell);
                    
                    String normalizedHeader = normalizeHeader(header);
                    if (!normalizedHeader.isEmpty() && !value.isEmpty()) {
                        member.put(normalizedHeader, value);
                        hasData = true;
                    }
                }
                
                if (hasData) {
                    members.add(member);
                }
            }
        }
        
        return members;
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                } else {
                    // Check if it's a whole number
                    double numValue = cell.getNumericCellValue();
                    if (numValue == (long) numValue) {
                        return String.valueOf((long) numValue);
                    } else {
                        return String.valueOf(numValue);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
    
    @Transactional
    private ImportMembersResponse processImport(List<Map<String, Object>> membersData) {
        List<String> errors = new ArrayList<>();
        List<MemberResponse> importedMembers = new ArrayList<>();
        int successful = 0;
        int failed = 0;
        
        for (int i = 0; i < membersData.size(); i++) {
            Map<String, Object> memberData = membersData.get(i);
            int rowNumber = i + 1;
            
            try {
                // Validate and convert to CreateMemberRequest
                CreateMemberRequest request = mapToCreateRequest(memberData);
                
                // Check for duplicate email
                if (memberRepository.findByEmail(request.getEmail()).isPresent()) {
                    errors.add("Row " + rowNumber + ": Member with email '" + request.getEmail() + "' already exists");
                    failed++;
                    continue;
                }
                
                // Create member
                Member member = mapToEntity(request);
                Member saved = memberRepository.save(member);
                importedMembers.add(mapToResponse(saved));
                successful++;
                
            } catch (Exception e) {
                errors.add("Row " + rowNumber + ": " + e.getMessage());
                failed++;
                log.error("Error processing member at row {}", rowNumber, e);
            }
        }
        
        return new ImportMembersResponse(
            membersData.size(),
            successful,
            failed,
            errors,
            importedMembers
        );
    }
    
    private CreateMemberRequest mapToCreateRequest(Map<String, Object> data) {
        CreateMemberRequest request = new CreateMemberRequest();
        
        // Determine type
        String type = getStringValue(data, "type", "memberType", "Type");
        if (type == null || type.isEmpty()) {
            // Infer type from data
            if (data.containsKey("firstName") || data.containsKey("first_name") || data.containsKey("First Name")) {
                type = "person";
            } else if (data.containsKey("name") || data.containsKey("Name") || data.containsKey("entityName")) {
                type = "entity";
            } else {
                throw new RuntimeException("Cannot determine member type. Provide 'type' field or firstName/name");
            }
        }
        request.setType(type.toLowerCase());
        
        if ("person".equals(request.getType())) {
            request.setFirstName(getStringValue(data, "firstName", "first_name", "First Name", "First"));
            request.setLastName(getStringValue(data, "lastName", "last_name", "Last Name", "Last"));
        } else {
            request.setName(getStringValue(data, "name", "Name", "entityName", "Entity Name"));
            String offlineStr = getStringValue(data, "offline", "Offline", "isOffline", "Is Offline");
            request.setOffline(offlineStr != null && (
                offlineStr.equalsIgnoreCase("true") || 
                offlineStr.equalsIgnoreCase("yes") || 
                offlineStr.equals("1")
            ));
        }
        
        request.setEmail(getStringValue(data, "email", "Email", "emailAddress"));
        if (request.getEmail() == null || request.getEmail().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        
        request.setPhone(getStringValue(data, "phone", "Phone", "phoneNumber", "Phone Number"));
        request.setWhatsapp(getStringValue(data, "whatsapp", "WhatsApp", "Whats App", "whatsApp"));
        request.setSpecializedIn(getStringValue(data, "specializedIn", "specialized_in", "Specialized In", "specialization", "Specialization"));
        request.setExperience(getStringValue(data, "experience", "Experience", "experienceYears", "Experience Years"));
        request.setAddress(getStringValue(data, "address", "Address"));
        
        return request;
    }
    
    private String getStringValue(Map<String, Object> data, String... keys) {
        for (String key : keys) {
            Object value = data.get(key);
            if (value != null) {
                return value.toString().trim();
            }
        }
        return null;
    }
    
    private Member mapToEntity(CreateMemberRequest request) {
        Member member = new Member();
        member.setType(request.getType());
        
        if ("person".equals(request.getType())) {
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
        
        return member;
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

