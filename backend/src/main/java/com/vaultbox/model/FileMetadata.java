package com.vaultbox.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "files")
public class FileMetadata {

    @Id
    private String id;

    private String originalName;

    private String s3Key;

    private String contentType;

    private Long size;

    private String ownerId;

    @CreatedDate
    private LocalDateTime uploadedAt;
}

