package com.motoneus.digitalgarage.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.couchbase.core.mapping.Document;
import org.springframework.data.couchbase.core.mapping.Field;

import java.time.Instant;
import java.util.List;

@Document
public class SecureDocument {

    @Id
    private String id;
    
    @Field
    private String ownerId;
    
    @Field
    private String title;
    
    @Field
    private String type = "document"; // Required for Sync Gateway
    
    @Field
    private String storageUrl;
    
    @Field
    private List<String> extractedDates;
    
    @Field
    private Instant createdAt;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStorageUrl() { return storageUrl; }
    public void setStorageUrl(String storageUrl) { this.storageUrl = storageUrl; }

    public List<String> getExtractedDates() { return extractedDates; }
    public void setExtractedDates(List<String> extractedDates) { this.extractedDates = extractedDates; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
