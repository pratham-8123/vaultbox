package com.vaultbox.repository;

import com.vaultbox.model.Folder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository extends MongoRepository<Folder, String> {

    /**
     * Find all folders in a specific parent folder for a user.
     * Use parentId = null for root-level folders.
     */
    List<Folder> findByOwnerIdAndParentIdOrderByNameAsc(String ownerId, String parentId);

    /**
     * Check if a folder with the same name exists in the same parent for a user.
     * Used to enforce unique folder names within a directory.
     */
    boolean existsByOwnerIdAndParentIdAndName(String ownerId, String parentId, String name);

    /**
     * Check for duplicate name excluding a specific folder (for rename validation).
     */
    boolean existsByOwnerIdAndParentIdAndNameAndIdNot(String ownerId, String parentId, String name, String excludeId);

    /**
     * Find all subfolders (direct children) of a folder.
     */
    List<Folder> findByParentId(String parentId);

    /**
     * Find all folders whose path starts with a given prefix.
     * Used for cascade operations when moving/deleting folders.
     */
    List<Folder> findByOwnerIdAndPathStartingWith(String ownerId, String pathPrefix);

    /**
     * Search folders by name (case-insensitive partial match).
     */
    Page<Folder> findByOwnerIdAndNameContainingIgnoreCase(String ownerId, String name, Pageable pageable);

    /**
     * Count folders matching search term for pagination.
     */
    long countByOwnerIdAndNameContainingIgnoreCase(String ownerId, String name);

    /**
     * Find folder by owner and ID (for authorization check).
     */
    Optional<Folder> findByIdAndOwnerId(String id, String ownerId);
}


