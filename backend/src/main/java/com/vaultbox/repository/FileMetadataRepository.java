package com.vaultbox.repository;

import com.vaultbox.model.FileMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileMetadataRepository extends MongoRepository<FileMetadata, String> {
    
    List<FileMetadata> findByOwnerId(String ownerId);
    
    List<FileMetadata> findAllByOrderByUploadedAtDesc();
    
    List<FileMetadata> findByOwnerIdOrderByUploadedAtDesc(String ownerId);

    /**
     * Find all files in a specific folder for a user.
     * Use parentFolderId = null for root-level files.
     */
    List<FileMetadata> findByOwnerIdAndParentFolderIdOrderByOriginalNameAsc(String ownerId, String parentFolderId);

    /**
     * Find all files in a folder (for cascade delete).
     */
    List<FileMetadata> findByParentFolderId(String parentFolderId);

    /**
     * Search files by name (case-insensitive partial match).
     */
    Page<FileMetadata> findByOwnerIdAndOriginalNameContainingIgnoreCase(String ownerId, String name, Pageable pageable);

    /**
     * Count files matching search term for pagination.
     */
    long countByOwnerIdAndOriginalNameContainingIgnoreCase(String ownerId, String name);

    /**
     * Find files without a path (for migration of legacy data).
     */
    @Query("{ 'path': { $exists: false } }")
    List<FileMetadata> findFilesWithoutPath();

    /**
     * Find files whose path starts with a given prefix.
     * Used when updating paths after folder operations.
     */
    List<FileMetadata> findByOwnerIdAndPathStartingWith(String ownerId, String pathPrefix);
}
