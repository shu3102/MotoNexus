package com.motoneus.digitalgarage.controller;

import com.motoneus.digitalgarage.model.SecureDocument;
import com.motoneus.digitalgarage.repository.DocumentRepository;
import com.motoneus.digitalgarage.service.AiClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/garage/documents")
public class GarageDocumentController {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private AiClientService aiClientService;

    @GetMapping
    public ResponseEntity<List<SecureDocument>> getDocuments(@AuthenticationPrincipal Jwt jwt) {
        String ownerId = jwt.getSubject();
        return ResponseEntity.ok(documentRepository.findByOwnerId(ownerId));
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file) {
        
        try {
            String ownerId = jwt.getSubject();
            
            // 1. Call Python AI Service for OCR
            List<String> dates = aiClientService.extractDatesFromDocument(file);
            
            // Validate dates
            boolean hasFutureDate = false;
            java.time.LocalDate today = java.time.LocalDate.now();
            
            for (String dateStr : dates) {
                try {
                    // Python AI now returns normalized YYYY-MM-DD
                    java.time.LocalDate parsedDate = java.time.LocalDate.parse(dateStr);
                    if (!parsedDate.isBefore(today)) {
                        hasFutureDate = true;
                        break;
                    }
                } catch (Exception ignored) {}
            }
            
            if (!dates.isEmpty() && !hasFutureDate) {
                return ResponseEntity.badRequest().body("REJECTED: Document has already expired! Cannot save to Digital Garage.");
            }
            
            // 2. Save Document Metadata to Couchbase
            SecureDocument doc = new SecureDocument();
            doc.setId("doc_" + ownerId + "_" + Instant.now().toEpochMilli());
            doc.setOwnerId(ownerId);
            doc.setTitle(title);
            doc.setExtractedDates(dates);
            doc.setCreatedAt(Instant.now());
            // Normally you would upload the physical file to S3 and store the URL here.
            doc.setStorageUrl("/storage/" + file.getOriginalFilename());
            
            SecureDocument saved = documentRepository.save(doc);
            return ResponseEntity.ok(saved);
            
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error processing document: " + e.getMessage());
        }
    }
}
