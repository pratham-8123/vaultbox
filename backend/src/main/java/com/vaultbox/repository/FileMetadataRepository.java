package com.vaultbox.repository;

import com.vaultbox.model.FileMetadata;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileMetadataRepository extends MongoRepository<FileMetadata, String> {
    
    List<FileMetadata> findByOwnerId(String ownerId);
    
    List<FileMetadata> findAllByOrderByUploadedAtDesc();
    
    List<FileMetadata> findByOwnerIdOrderByUploadedAtDesc(String ownerId);
}

