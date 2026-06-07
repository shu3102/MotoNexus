package com.motoneus.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        String authProviderId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        String username = jwt.getClaimAsString("preferred_username");

        Optional<UserDocument> existingUser = userRepository.findByAuthProviderId(authProviderId);
        if (existingUser.isPresent()) {
            return ResponseEntity.ok(existingUser.get());
        }

        UserDocument newUser = new UserDocument();
        newUser.setId("user_" + authProviderId);
        newUser.setAuthProviderId(authProviderId);
        newUser.setEmail(email);
        newUser.setUsername(username);
        newUser.setCreatedAt(Instant.now());

        UserDocument savedUser = userRepository.save(newUser);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal Jwt jwt) {
        String authProviderId = jwt.getSubject();
        Optional<UserDocument> user = userRepository.findByAuthProviderId(authProviderId);
        return user.map(ResponseEntity::ok)
                   .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
