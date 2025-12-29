package com.vaultbox.controller;

import com.vaultbox.dto.FileResponse;
import com.vaultbox.dto.MessageResponse;
import com.vaultbox.model.FileMetadata;
import com.vaultbox.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    /**
     * Upload a file to a specific folder or root level.
     *
     * @param file           The file to upload
     * @param parentFolderId Optional parent folder ID (null/empty for root)
     */
    @PostMapping("/upload")
    public ResponseEntity<FileResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "parentFolderId", required = false) String parentFolderId) {
        FileResponse response = fileService.uploadFile(file, parentFolderId);
        return ResponseEntity.ok(response);
    }

    /**
     * List all files (deprecated - use /api/browse instead).
     */
    @GetMapping
    public ResponseEntity<List<FileResponse>> listFiles() {
        List<FileResponse> files = fileService.listFiles();
        return ResponseEntity.ok(files);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileResponse> getFile(@PathVariable String id) {
        FileResponse response = fileService.getFileMetadata(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String id) {
        FileMetadata metadata = fileService.getFileMetadataEntity(id);
        byte[] content = fileService.downloadFile(id);

        // Determine if file should be viewed inline or downloaded
        String contentDisposition = isInlineViewable(metadata.getContentType())
                ? "inline; filename=\"" + metadata.getOriginalName() + "\""
                : "attachment; filename=\"" + metadata.getOriginalName() + "\"";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .contentType(MediaType.parseMediaType(metadata.getContentType()))
                .contentLength(content.length)
                .body(content);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteFile(@PathVariable String id) {
        fileService.deleteFile(id);
        return ResponseEntity.ok(new MessageResponse("File deleted successfully"));
    }

    private boolean isInlineViewable(String contentType) {
        if (contentType == null) return false;
        return contentType.startsWith("image/") ||
               contentType.equals("text/plain") ||
               contentType.equals("application/json") ||
               contentType.equals("application/pdf");
    }
}
