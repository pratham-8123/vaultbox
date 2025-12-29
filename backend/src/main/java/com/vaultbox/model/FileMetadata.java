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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "files")
@CompoundIndexes({
    @CompoundIndex(name = "owner_folder_idx", def = "{'ownerId': 1, 'parentFolderId': 1}"),
    @CompoundIndex(name = "owner_name_idx", def = "{'ownerId': 1, 'originalName': 1}")
})
public class FileMetadata {

    @Id
    private String id;

    private String originalName;

    private String s3Key;

    private String contentType;

    private Long size;

    private String ownerId;

    /**
     * Parent folder ID. Null indicates file is at root level.
     */
    private String parentFolderId;

    /**
     * Full path including filename.
     * Format: "/FolderA/FolderB/filename.ext"
     * Root-level files have path "/filename.ext"
     */
    private String path;

    @CreatedDate
    private LocalDateTime uploadedAt;
}
