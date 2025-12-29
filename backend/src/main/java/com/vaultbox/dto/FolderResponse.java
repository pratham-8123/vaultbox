package com.vaultbox.dto;

import com.vaultbox.model.Folder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class FolderResponse {

    private String id;
    private String name;
    private String parentId;
    private String path;
    private String ownerId;
    private String ownerEmail;
    private LocalDateTime createdAt;

    public static FolderResponse from(Folder folder) {
        return FolderResponse.builder()
                .id(folder.getId())
                .name(folder.getName())
                .parentId(folder.getParentId())
                .path(folder.getPath())
                .ownerId(folder.getOwnerId())
                .createdAt(folder.getCreatedAt())
                .build();
    }

    public static FolderResponse from(Folder folder, String ownerEmail) {
        FolderResponse response = from(folder);
        response.setOwnerEmail(ownerEmail);
        return response;
    }
}


