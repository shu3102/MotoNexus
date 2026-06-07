package com.motoneus.community.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.couchbase.core.mapping.Document;
import org.springframework.data.couchbase.core.mapping.Field;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Document
public class Post {

    @Id
    private String id;
    
    @Field
    private String authorId;
    
    @Field
    private String content;
    
    @Field
    private String imageUrl;
    
    @Field
    private Instant createdAt = Instant.now();
    
    @Field
    private List<Comment> comments = new ArrayList<>();
    
    @Field
    private List<String> likes = new ArrayList<>(); // List of user IDs who liked it

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    public List<String> getLikes() { return likes; }
    public void setLikes(List<String> likes) { this.likes = likes; }
}

class Comment {
    private String id = UUID.randomUUID().toString();
    private String authorId;
    private String content;
    private Instant createdAt = Instant.now();

    public Comment() {}
    public Comment(String authorId, String content) {
        this.authorId = authorId;
        this.content = content;
    }

    public String getId() { return id; }
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Instant getCreatedAt() { return createdAt; }
}
