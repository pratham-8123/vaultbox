package com.vaultbox.dto;

import com.vaultbox.model.FileMetadata;
import com.vaultbox.model.Folder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Unified search result item for both files and folders.
 */
@Data
@Builder
@AllArgsConstructor
public class SearchResultItem {

    public enum ItemType {
        FILE, FOLDER
    }

    private ItemType type;
    private String id;
    private String name;
    private String path;
    private String ownerId;
    private String ownerEmail;
    private LocalDateTime createdAt;

    // File-specific fields (null for folders)
    private String contentType;
    private Long size;
    private boolean viewable;

    public static SearchResultItem fromFolder(Folder folder, String ownerEmail) {
        return SearchResultItem.builder()
                .type(ItemType.FOLDER)
                .id(folder.getId())
                .name(folder.getName())
                .path(folder.getPath())
                .ownerId(folder.getOwnerId())
                .ownerEmail(ownerEmail)
                .createdAt(folder.getCreatedAt())
                .build();
    }

    public static SearchResultItem fromFile(FileMetadata file, String ownerEmail) {
        return SearchResultItem.builder()
                .type(ItemType.FILE)
                .id(file.getId())
                .name(file.getOriginalName())
                .path(file.getPath())
                .ownerId(file.getOwnerId())
                .ownerEmail(ownerEmail)
                .createdAt(file.getUploadedAt())
                .contentType(file.getContentType())
                .size(file.getSize())
                .viewable(isViewableType(file.getContentType()))
                .build();
    }

    private static boolean isViewableType(String contentType) {
        if (contentType == null) return false;
        return contentType.startsWith("image/") ||
               contentType.equals("text/plain") ||
               contentType.equals("application/json") ||
               contentType.equals("application/pdf");
    }
}


