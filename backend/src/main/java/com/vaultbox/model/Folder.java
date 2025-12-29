package com.vaultbox.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Represents a folder in the user's file hierarchy.
 * Uses adjacency list (parentId) for tree structure and materialized path for efficient queries.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "folders")
@CompoundIndexes({
    @CompoundIndex(name = "owner_parent_idx", def = "{'ownerId': 1, 'parentId': 1}"),
    @CompoundIndex(name = "owner_name_idx", def = "{'ownerId': 1, 'name': 1}")
})
public class Folder {

    @Id
    private String id;

    private String name;

    /**
     * Parent folder ID. Null indicates root level.
     */
    private String parentId;

    /**
     * Materialized path for breadcrumb generation.
     * Format: "/FolderA/FolderB/CurrentFolder"
     * Root-level folders have path "/{name}"
     */
    private String path;

    private String ownerId;

    @CreatedDate
    private LocalDateTime createdAt;
}


