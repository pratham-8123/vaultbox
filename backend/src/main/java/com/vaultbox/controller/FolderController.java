package com.vaultbox.controller;

import com.vaultbox.dto.FolderRequest;
import com.vaultbox.dto.FolderResponse;
import com.vaultbox.dto.MessageResponse;
import com.vaultbox.service.FolderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @PostMapping
    public ResponseEntity<FolderResponse> createFolder(@Valid @RequestBody FolderRequest request) {
        FolderResponse response = folderService.createFolder(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<FolderResponse> getFolder(@PathVariable String id) {
        FolderResponse response = folderService.getFolder(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<FolderResponse>> listFolders(
            @RequestParam(required = false) String parentId,
            @RequestParam(required = false) String userId) {
        List<FolderResponse> folders = folderService.listFolders(parentId, userId);
        return ResponseEntity.ok(folders);
    }

    @PatchMapping("/{id}/rename")
    public ResponseEntity<FolderResponse> renameFolder(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        String newName = request.get("name");
        if (newName == null || newName.isBlank()) {
            throw new IllegalArgumentException("New folder name is required");
        }
        FolderResponse response = folderService.renameFolder(id, newName);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteFolder(@PathVariable String id) {
        folderService.deleteFolder(id);
        return ResponseEntity.ok(new MessageResponse("Folder deleted successfully"));
    }
}


