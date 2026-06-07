package com.motoneus.digitalgarage.repository;

import com.motoneus.digitalgarage.model.VehicleDocument;
import org.springframework.data.couchbase.repository.CouchbaseRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehicleRepository extends CouchbaseRepository<VehicleDocument, String> {
    List<VehicleDocument> findByOwnerId(String ownerId);
}
