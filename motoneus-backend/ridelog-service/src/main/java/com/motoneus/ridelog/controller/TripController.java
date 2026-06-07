package com.motoneus.ridelog.controller;

import com.motoneus.ridelog.model.Trip;
import com.motoneus.ridelog.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ridelog")
public class TripController {

    @Autowired
    private TripRepository tripRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/start")
    public ResponseEntity<Trip> startTrip(@AuthenticationPrincipal Jwt jwt) {
        String riderId = jwt.getSubject();
        
        Trip newTrip = new Trip();
        newTrip.setId("trip_" + riderId + "_" + Instant.now().toEpochMilli());
        newTrip.setRiderId(riderId);
        newTrip.setStartTime(Instant.now());
        newTrip.setStatus("ACTIVE");
        
        return ResponseEntity.ok(tripRepository.save(newTrip));
    }

    @PostMapping("/{tripId}/stop")
    public ResponseEntity<?> stopTrip(@AuthenticationPrincipal Jwt jwt, @PathVariable String tripId) {
        String riderId = jwt.getSubject();
        Trip trip = tripRepository.findById(tripId).orElseThrow();
        
        if (!trip.getRiderId().equals(riderId)) {
            return ResponseEntity.status(403).build();
        }
        
        trip.setStatus("COMPLETED");
        trip.setEndTime(Instant.now());
        
        // 1. Call AI Service for Trip Analytics
        try {
            String aiUrl = "http://localhost:8000/api/ai/analytics/trip";
            ResponseEntity<Map> aiResponse = restTemplate.postForEntity(aiUrl, trip.getRoute(), Map.class);
            
            if (aiResponse.getStatusCode().is2xxSuccessful() && aiResponse.getBody() != null) {
                com.motoneus.ridelog.model.TripAnalytics analytics = new com.motoneus.ridelog.model.TripAnalytics();
                Map<String, Object> body = aiResponse.getBody();
                analytics.setAvgSpeed(((Number) body.getOrDefault("avg_speed", 0.0)).doubleValue());
                analytics.setMaxLeanAngle(((Number) body.getOrDefault("max_lean_angle", 0.0)).doubleValue());
                analytics.setEstimatedFuelCost(((Number) body.getOrDefault("estimated_fuel_cost", 0.0)).doubleValue());
                trip.setAnalytics(analytics);
            }
        } catch (Exception e) {
            System.err.println("AI Analytics failed: " + e.getMessage());
        }

        return ResponseEntity.ok(tripRepository.save(trip));
    }

    @GetMapping
    public ResponseEntity<List<Trip>> getTrips(@AuthenticationPrincipal Jwt jwt) {
        String riderId = jwt.getSubject();
        return ResponseEntity.ok(tripRepository.findByRiderId(riderId));
    }
}
