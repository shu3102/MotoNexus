package com.motoneus.digitalgarage.repository;

import com.motoneus.digitalgarage.model.SecureDocument;
import org.springframework.data.couchbase.repository.CouchbaseRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends CouchbaseRepository<SecureDocument, String> {
    List<SecureDocument> findByOwnerId(String ownerId);
}
