package com.motoneus.digitalgarage.controller;

import com.motoneus.digitalgarage.model.VehicleDocument;
import com.motoneus.digitalgarage.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/garage/vehicles")
public class VehicleController {

    @Autowired
    private VehicleRepository vehicleRepository;

    @GetMapping
    public ResponseEntity<List<VehicleDocument>> getVehicles(@AuthenticationPrincipal Jwt jwt) {
        String ownerId = jwt.getSubject();
        return ResponseEntity.ok(vehicleRepository.findByOwnerId(ownerId));
    }

    @PostMapping
    public ResponseEntity<VehicleDocument> addVehicle(@AuthenticationPrincipal Jwt jwt, @RequestBody VehicleDocument vehicle) {
        String ownerId = jwt.getSubject();
        vehicle.setOwnerId(ownerId);
        vehicle.setId("vehicle_" + ownerId + "_" + Instant.now().toEpochMilli());
        vehicle.setCreatedAt(Instant.now());
        
        VehicleDocument saved = vehicleRepository.save(vehicle);
        return ResponseEntity.ok(saved);
    }
}
