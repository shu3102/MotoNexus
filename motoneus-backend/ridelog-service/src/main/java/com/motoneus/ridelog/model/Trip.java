package com.motoneus.ridelog.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.couchbase.core.mapping.Document;
import org.springframework.data.couchbase.core.mapping.Field;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document
public class Trip {

    @Id
    private String id;
    
    @Field
    private String riderId;
    
    @Field
    private String status = "ACTIVE"; // ACTIVE, COMPLETED
    
    @Field
    private List<LocationPoint> route = new ArrayList<>();
    
    @Field
    private Double totalDistanceKm = 0.0;
    
    @Field
    private Instant startTime;
    
    @Field
    private Instant endTime;
    
    @Field
    private TripAnalytics analytics;

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRiderId() { return riderId; }
    public void setRiderId(String riderId) { this.riderId = riderId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<LocationPoint> getRoute() { return route; }
    public void setRoute(List<LocationPoint> route) { this.route = route; }

    public Double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(Double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

    public Instant getStartTime() { return startTime; }
    public void setStartTime(Instant startTime) { this.startTime = startTime; }

    public Instant getEndTime() { return endTime; }
    public void setEndTime(Instant endTime) { this.endTime = endTime; }

    public TripAnalytics getAnalytics() { return analytics; }
    public void setAnalytics(TripAnalytics analytics) { this.analytics = analytics; }
}

class LocationPoint {
    private Double lat;
    private Double lng;
    private Long timestamp;

    public LocationPoint() {}
    public LocationPoint(Double lat, Double lng, Long timestamp) {
        this.lat = lat;
        this.lng = lng;
        this.timestamp = timestamp;
    }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
}

class TripAnalytics {
    private Double maxLeanAngle;
    private Double avgSpeed;
    private Double estimatedFuelCost;
    
    public Double getMaxLeanAngle() { return maxLeanAngle; }
    public void setMaxLeanAngle(Double maxLeanAngle) { this.maxLeanAngle = maxLeanAngle; }

    public Double getAvgSpeed() { return avgSpeed; }
    public void setAvgSpeed(Double avgSpeed) { this.avgSpeed = avgSpeed; }

    public Double getEstimatedFuelCost() { return estimatedFuelCost; }
    public void setEstimatedFuelCost(Double estimatedFuelCost) { this.estimatedFuelCost = estimatedFuelCost; }
}
