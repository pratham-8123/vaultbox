package com.vaultbox.service;

import com.vaultbox.dto.FileResponse;
import com.vaultbox.exception.FileUploadException;
import com.vaultbox.exception.ResourceNotFoundException;
import com.vaultbox.model.FileMetadata;
import com.vaultbox.model.Role;
import com.vaultbox.model.User;
import com.vaultbox.repository.FileMetadataRepository;
import com.vaultbox.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service responsible for file operations including upload, download, list, and delete.
 * Handles authorization checks to ensure users can only access their own files,
 * while admins have access to all files.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final FileMetadataRepository fileRepository;
    private final UserRepository userRepository;
    private final S3Service s3Service;
    private final AuthService authService;

    @Value("${file.allowed-types}")
    private String allowedTypes;

    @Value("${file.max-size-mb}")
    private int maxSizeMb;

    private static final long BYTES_PER_MB = 1024 * 1024;

    /**
     * Uploads a file to S3 and stores metadata in MongoDB.
     * Validates file size and type before upload.
     */
    public FileResponse uploadFile(MultipartFile file) {
        User currentUser = authService.getCurrentUser();
        
        validateFile(file);

        String s3Key = s3Service.uploadFile(file, currentUser.getId());

        FileMetadata metadata = FileMetadata.builder()
                .originalName(file.getOriginalFilename())
                .s3Key(s3Key)
                .contentType(file.getContentType())
                .size(file.getSize())
                .ownerId(currentUser.getId())
                .build();

        metadata = fileRepository.save(metadata);
        log.info("File metadata saved: {} by user {}", metadata.getId(), currentUser.getEmail());

        return FileResponse.from(metadata, currentUser.getEmail());
    }

    /**
     * Lists files based on user role.
     * Admins see all files, regular users see only their own.
     */
    public List<FileResponse> listFiles() {
        User currentUser = authService.getCurrentUser();

        List<FileMetadata> files;
        if (currentUser.getRole() == Role.ADMIN) {
            files = fileRepository.findAllByOrderByUploadedAtDesc();
        } else {
            files = fileRepository.findByOwnerIdOrderByUploadedAtDesc(currentUser.getId());
        }

        return files.stream()
                .map(this::toFileResponseWithOwner)
                .collect(Collectors.toList());
    }

    public FileResponse getFileMetadata(String fileId) {
        FileMetadata metadata = getFileWithAccessCheck(fileId);
        return toFileResponseWithOwner(metadata);
    }

    public byte[] downloadFile(String fileId) {
        FileMetadata metadata = getFileWithAccessCheck(fileId);
        return s3Service.downloadFile(metadata.getS3Key());
    }

    public FileMetadata getFileMetadataEntity(String fileId) {
        return getFileWithAccessCheck(fileId);
    }

    /**
     * Deletes a file from both S3 and MongoDB.
     * Requires ownership or admin privileges.
     */
    public void deleteFile(String fileId) {
        FileMetadata metadata = getFileWithAccessCheck(fileId);
        
        s3Service.deleteFile(metadata.getS3Key());
        fileRepository.delete(metadata);
        
        log.info("File deleted: {} by user {}", fileId, authService.getCurrentUser().getEmail());
    }

    /**
     * Retrieves file metadata with authorization check.
     * Throws AccessDeniedException if user doesn't own the file and isn't admin.
     */
    private FileMetadata getFileWithAccessCheck(String fileId) {
        FileMetadata metadata = fileRepository.findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("File", "id", fileId));

        User currentUser = authService.getCurrentUser();

        if (currentUser.getRole() == Role.ADMIN) {
            return metadata;
        }

        if (!metadata.getOwnerId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You don't have permission to access this file");
        }

        return metadata;
    }

    /**
     * Validates file before upload - checks size limit and allowed types.
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileUploadException("File is empty");
        }

        long maxBytes = (long) maxSizeMb * BYTES_PER_MB;
        if (file.getSize() > maxBytes) {
            throw new FileUploadException(
                String.format("File size exceeds maximum limit of %d MB", maxSizeMb)
            );
        }

        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        
        if (!isAllowedFileType(contentType, filename)) {
            throw new FileUploadException(
                "File type not allowed. Allowed types: " + allowedTypes
            );
        }
    }

    /**
     * Checks if file type is allowed by extension or MIME type.
     * Uses both extension and content-type for robust validation.
     */
    private boolean isAllowedFileType(String contentType, String filename) {
        Set<String> allowed = Arrays.stream(allowedTypes.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        // Primary check: file extension
        if (filename != null) {
            String extension = getFileExtension(filename).toLowerCase();
            if (allowed.contains(extension)) {
                return true;
            }
        }

        // Secondary check: MIME content type
        if (contentType != null) {
            if (contentType.equals("text/plain") && allowed.contains("txt")) return true;
            if (contentType.equals("application/json") && allowed.contains("json")) return true;
            if (contentType.equals("application/pdf") && allowed.contains("pdf")) return true;
            if (contentType.equals("image/jpeg") && (allowed.contains("jpg") || allowed.contains("jpeg"))) return true;
            if (contentType.equals("image/png") && allowed.contains("png")) return true;
            if (contentType.equals("image/gif") && allowed.contains("gif")) return true;
            if (contentType.equals("image/webp") && allowed.contains("webp")) return true;
        }

        return false;
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }

    private FileResponse toFileResponseWithOwner(FileMetadata metadata) {
        String ownerEmail = userRepository.findById(metadata.getOwnerId())
                .map(User::getEmail)
                .orElse("Unknown");
        return FileResponse.from(metadata, ownerEmail);
    }
}
