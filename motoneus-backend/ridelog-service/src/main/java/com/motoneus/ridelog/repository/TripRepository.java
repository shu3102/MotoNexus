package com.motoneus.ridelog.repository;

import com.motoneus.ridelog.model.Trip;
import org.springframework.data.couchbase.repository.CouchbaseRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripRepository extends CouchbaseRepository<Trip, String> {
    List<Trip> findByRiderId(String riderId);
    List<Trip> findByRiderIdAndStatus(String riderId, String status);
}
