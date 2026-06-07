package com.motoneus.community.controller;

import com.motoneus.community.model.Post;
import com.motoneus.community.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/community/posts")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private com.motoneus.community.service.StorageService storageService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<Post> createPost(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("content") String content,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file) {
        
        Post post = new Post();
        post.setId("post_" + UUID.randomUUID().toString());
        post.setAuthorId(jwt.getSubject());
        post.setContent(content);
        
        if (file != null && !file.isEmpty()) {
            String fileUrl = storageService.store(file);
            post.setImageUrl(fileUrl);
        }
        
        return ResponseEntity.ok(postRepository.save(post));
    }

    @GetMapping
    public ResponseEntity<Iterable<Post>> getAllPosts() {
        return ResponseEntity.ok(postRepository.findAll());
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<Post> toggleLike(@AuthenticationPrincipal Jwt jwt, @PathVariable String postId) {
        Post post = postRepository.findById(postId).orElseThrow();
        String userId = jwt.getSubject();
        
        if (post.getLikes().contains(userId)) {
            post.getLikes().remove(userId);
        } else {
            post.getLikes().add(userId);
        }
        
        return ResponseEntity.ok(postRepository.save(post));
    }
}
