package com.vaultbox.service;

import com.vaultbox.dto.FolderRequest;
import com.vaultbox.dto.FolderResponse;
import com.vaultbox.exception.ResourceNotFoundException;
import com.vaultbox.model.FileMetadata;
import com.vaultbox.model.Folder;
import com.vaultbox.model.Role;
import com.vaultbox.model.User;
import com.vaultbox.repository.FileMetadataRepository;
import com.vaultbox.repository.FolderRepository;
import com.vaultbox.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for folder CRUD operations with authorization enforcement.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FolderService {

    private final FolderRepository folderRepository;
    private final FileMetadataRepository fileRepository;
    private final UserRepository userRepository;
    private final AuthService authService;
    private final S3Service s3Service;

    /**
     * Creates a new folder for the current user.
     */
    public FolderResponse createFolder(FolderRequest request) {
        User currentUser = authService.getCurrentUser();
        String parentId = normalizeParentId(request.getParentId());

        // Validate parent folder if specified
        String parentPath = "";
        if (parentId != null) {
            Folder parent = getFolderWithAccessCheck(parentId);
            parentPath = parent.getPath();
        }

        // Check for duplicate name in same parent
        if (folderRepository.existsByOwnerIdAndParentIdAndName(
                currentUser.getId(), parentId, request.getName())) {
            throw new IllegalArgumentException("A folder with this name already exists in this location");
        }

        String path = parentPath + "/" + request.getName();

        Folder folder = Folder.builder()
                .name(request.getName())
                .parentId(parentId)
                .path(path)
                .ownerId(currentUser.getId())
                .build();

        folder = folderRepository.save(folder);
        log.info("Folder created: {} by user {}", folder.getId(), currentUser.getEmail());

        return FolderResponse.from(folder, currentUser.getEmail());
    }

    /**
     * Renames an existing folder.
     */
    public FolderResponse renameFolder(String folderId, String newName) {
        User currentUser = authService.getCurrentUser();
        Folder folder = getFolderWithAccessCheck(folderId);

        // Check for duplicate name in same parent
        if (folderRepository.existsByOwnerIdAndParentIdAndNameAndIdNot(
                folder.getOwnerId(), folder.getParentId(), newName, folderId)) {
            throw new IllegalArgumentException("A folder with this name already exists in this location");
        }

        String oldPath = folder.getPath();
        String newPath = oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + newName;

        // Update paths of all descendants
        updateDescendantPaths(folder.getOwnerId(), oldPath, newPath);

        folder.setName(newName);
        folder.setPath(newPath);
        folder = folderRepository.save(folder);

        log.info("Folder renamed: {} to '{}' by user {}", folderId, newName, currentUser.getEmail());

        String ownerEmail = getOwnerEmail(folder.getOwnerId());
        return FolderResponse.from(folder, ownerEmail);
    }

    /**
     * Deletes a folder and all its contents recursively.
     */
    public void deleteFolder(String folderId) {
        User currentUser = authService.getCurrentUser();
        Folder folder = getFolderWithAccessCheck(folderId);

        deleteFolderRecursive(folder);

        log.info("Folder deleted: {} by user {}", folderId, currentUser.getEmail());
    }

    /**
     * Gets folder details by ID with authorization check.
     */
    public FolderResponse getFolder(String folderId) {
        Folder folder = getFolderWithAccessCheck(folderId);
        String ownerEmail = getOwnerEmail(folder.getOwnerId());
        return FolderResponse.from(folder, ownerEmail);
    }

    /**
     * Lists folders in a specific parent folder.
     * Admin can optionally view another user's folders.
     */
    public List<FolderResponse> listFolders(String parentId, String targetUserId) {
        User currentUser = authService.getCurrentUser();
        String ownerId = resolveTargetUserId(currentUser, targetUserId);
        String normalizedParentId = normalizeParentId(parentId);

        // If accessing a specific parent folder, verify access
        if (normalizedParentId != null) {
            Folder parent = folderRepository.findById(normalizedParentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", normalizedParentId));
            
            if (!parent.getOwnerId().equals(ownerId)) {
                throw new AccessDeniedException("Folder does not belong to the target user");
            }
        }

        List<Folder> folders = folderRepository.findByOwnerIdAndParentIdOrderByNameAsc(ownerId, normalizedParentId);

        return folders.stream()
                .map(f -> FolderResponse.from(f, getOwnerEmail(f.getOwnerId())))
                .collect(Collectors.toList());
    }

    /**
     * Gets a folder with authorization check.
     * Users can only access their own folders; admins can access all.
     */
    public Folder getFolderWithAccessCheck(String folderId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", folderId));

        User currentUser = authService.getCurrentUser();

        if (currentUser.getRole() == Role.ADMIN) {
            return folder;
        }

        if (!folder.getOwnerId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You don't have permission to access this folder");
        }

        return folder;
    }

    /**
     * Recursively deletes a folder, its subfolders, and all contained files.
     */
    private void deleteFolderRecursive(Folder folder) {
        // First, recursively delete all subfolders
        List<Folder> subfolders = folderRepository.findByParentId(folder.getId());
        for (Folder subfolder : subfolders) {
            deleteFolderRecursive(subfolder);
        }

        // Delete all files in this folder (including from S3)
        List<FileMetadata> files = fileRepository.findByParentFolderId(folder.getId());
        for (FileMetadata file : files) {
            s3Service.deleteFile(file.getS3Key());
            fileRepository.delete(file);
        }

        // Finally, delete the folder itself
        folderRepository.delete(folder);
    }

    /**
     * Updates paths of all folders and files under the given path prefix.
     * Used when a folder is renamed.
     */
    private void updateDescendantPaths(String ownerId, String oldPathPrefix, String newPathPrefix) {
        // Update folder paths
        List<Folder> descendantFolders = folderRepository.findByOwnerIdAndPathStartingWith(ownerId, oldPathPrefix + "/");
        for (Folder descendant : descendantFolders) {
            String updatedPath = newPathPrefix + descendant.getPath().substring(oldPathPrefix.length());
            descendant.setPath(updatedPath);
            folderRepository.save(descendant);
        }

        // Update file paths
        List<FileMetadata> descendantFiles = fileRepository.findByOwnerIdAndPathStartingWith(ownerId, oldPathPrefix + "/");
        for (FileMetadata file : descendantFiles) {
            String updatedPath = newPathPrefix + file.getPath().substring(oldPathPrefix.length());
            file.setPath(updatedPath);
            fileRepository.save(file);
        }
    }

    /**
     * Resolves the target user ID for listing operations.
     * Regular users can only target themselves; admins can target any user.
     */
    private String resolveTargetUserId(User currentUser, String targetUserId) {
        if (targetUserId == null || targetUserId.isBlank()) {
            return currentUser.getId();
        }

        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can view other users' folders");
        }

        // Verify target user exists
        if (!userRepository.existsById(targetUserId)) {
            throw new ResourceNotFoundException("User", "id", targetUserId);
        }

        return targetUserId;
    }

    private String normalizeParentId(String parentId) {
        return (parentId == null || parentId.isBlank()) ? null : parentId;
    }

    private String getOwnerEmail(String ownerId) {
        return userRepository.findById(ownerId)
                .map(User::getEmail)
                .orElse("Unknown");
    }
}


