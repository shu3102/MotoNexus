package com.motoneus.ridelog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.motoneus.ridelog.model.Trip;
import com.motoneus.ridelog.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class LocationKafkaConsumer {

    @Autowired
    private TripRepository tripRepository;
    
    private final ObjectMapper mapper = new ObjectMapper();

    @KafkaListener(topics = "location-updates", groupId = "ridelog-analytics-group")
    public void consumeLocation(String message) {
        try {
            JsonNode node = mapper.readTree(message);
            String riderId = node.get("riderId").asText();
            Double lat = node.get("lat").asDouble();
            Double lng = node.get("lng").asDouble();
            Long timestamp = node.has("timestamp") ? node.get("timestamp").asLong() : System.currentTimeMillis();

            // Find an ACTIVE trip for this rider
            List<Trip> activeTrips = tripRepository.findByRiderIdAndStatus(riderId, "ACTIVE");
            if (!activeTrips.isEmpty()) {
                Trip activeTrip = activeTrips.get(0);
                activeTrip.getRoute().add(new com.motoneus.ridelog.model.LocationPoint(lat, lng, timestamp));
                
                // Extremely basic distance calculation just for demo logging
                if (activeTrip.getRoute().size() > 1) {
                    activeTrip.setTotalDistanceKm(activeTrip.getTotalDistanceKm() + 0.1); 
                }
                
                tripRepository.save(activeTrip);
                System.out.println("RideLog: Added GPS point to Trip " + activeTrip.getId());
            }

        } catch (Exception e) {
            System.err.println("Error processing Kafka location update: " + e.getMessage());
        }
    }
}
