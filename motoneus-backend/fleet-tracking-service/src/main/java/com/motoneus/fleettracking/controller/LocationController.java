package com.motoneus.fleettracking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/fleet")
public class LocationController {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/location")
    public ResponseEntity<?> updateLocation(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> locationData) {
        String riderId = jwt.getSubject();
        locationData.put("riderId", riderId);
        locationData.put("timestamp", System.currentTimeMillis());

        // Convert to string for Kafka
        String payload = locationData.toString(); // Real app uses ObjectMapper

        // 1. Send to Kafka for analytics/storage
        kafkaTemplate.send("location-updates", riderId, payload);

        // 2. Broadcast via WebSockets for real-time fleet view
        messagingTemplate.convertAndSend("/topic/locations", locationData);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/sos")
    public ResponseEntity<?> triggerSOS(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> sosData) {
        String riderId = jwt.getSubject();
        sosData.put("riderId", riderId);
        sosData.put("alertType", "EMERGENCY_SOS");
        
        // 1. Send to Kafka SOS topic
        kafkaTemplate.send("sos-alerts", riderId, sosData.toString());

        // 2. Broadcast high-priority alert
        messagingTemplate.convertAndSend("/topic/sos", sosData);

        return ResponseEntity.ok().body("SOS Alert Triggered and Broadcasted!");
    }
}
