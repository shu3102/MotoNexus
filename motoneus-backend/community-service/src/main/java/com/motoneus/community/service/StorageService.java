package com.motoneus.community.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class StorageService {

    private final String uploadDir = "uploads/";

    public StorageService() {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdir();
        }
    }

    public String store(MultipartFile file) {
        if (file.isEmpty()) return null;
        
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir + fileName);
            Files.copy(file.getInputStream(), path);
            return "/api/community/files/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file", e);
        }
    }
}
