package com.motoneus.community.repository;

import com.motoneus.community.model.Post;
import org.springframework.data.couchbase.repository.CouchbaseRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends CouchbaseRepository<Post, String> {
}
