package com.vaultbox.dto;

import com.vaultbox.model.FileMetadata;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class FileResponse {

    private String id;
    private String name;
    private String contentType;
    private Long size;
    private String ownerId;
    private String ownerEmail;
    private LocalDateTime uploadedAt;
    private boolean viewable;

    public static FileResponse from(FileMetadata metadata) {
        return FileResponse.builder()
                .id(metadata.getId())
                .name(metadata.getOriginalName())
                .contentType(metadata.getContentType())
                .size(metadata.getSize())
                .ownerId(metadata.getOwnerId())
                .uploadedAt(metadata.getUploadedAt())
                .viewable(isViewableType(metadata.getContentType()))
                .build();
    }

    public static FileResponse from(FileMetadata metadata, String ownerEmail) {
        FileResponse response = from(metadata);
        response.setOwnerEmail(ownerEmail);
        return response;
    }

    private static boolean isViewableType(String contentType) {
        if (contentType == null) return false;
        return contentType.startsWith("image/") ||
               contentType.equals("text/plain") ||
               contentType.equals("application/json") ||
               contentType.equals("application/pdf");
    }
}

