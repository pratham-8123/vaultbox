package com.vaultbox.service;

import com.vaultbox.exception.FileUploadException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    /**
     * Uploads a file to S3 with user-prefixed key structure.
     * Key format: vaultbox/{userId}/{uuid}_{originalFilename}
     */
    public String uploadFile(MultipartFile file, String userId) {
        String originalFilename = file.getOriginalFilename();
        String s3Key = buildS3Key(userId, originalFilename);

        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(
                    file.getInputStream(), 
                    file.getSize()
            ));

            log.info("File uploaded to S3: {}", s3Key);
            return s3Key;

        } catch (IOException e) {
            throw new FileUploadException("Failed to read file content", e);
        } catch (S3Exception e) {
            log.error("S3 upload error: {}", e.getMessage());
            throw new FileUploadException("Failed to upload file to storage", e);
        }
    }

    /**
     * Downloads file content from S3.
     */
    public byte[] downloadFile(String s3Key) {
        try {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            return s3Client.getObjectAsBytes(getRequest).asByteArray();

        } catch (NoSuchKeyException e) {
            throw new FileUploadException("File not found in storage");
        } catch (S3Exception e) {
            log.error("S3 download error: {}", e.getMessage());
            throw new FileUploadException("Failed to download file from storage", e);
        }
    }

    /**
     * Deletes a file from S3.
     */
    public void deleteFile(String s3Key) {
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();

            s3Client.deleteObject(deleteRequest);
            log.info("File deleted from S3: {}", s3Key);

        } catch (S3Exception e) {
            log.error("S3 delete error: {}", e.getMessage());
            throw new FileUploadException("Failed to delete file from storage", e);
        }
    }

    private String buildS3Key(String userId, String originalFilename) {
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String sanitizedFilename = sanitizeFilename(originalFilename);
        return String.format("vaultbox/%s/%s_%s", userId, uuid, sanitizedFilename);
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) {
            return "unnamed";
        }
        // Remove any path traversal attempts and keep only alphanumeric, dots, hyphens, underscores
        return filename.replaceAll("[^a-zA-Z0-9.\\-_]", "_");
    }
}

