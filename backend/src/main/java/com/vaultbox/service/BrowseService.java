package com.vaultbox.service;

import com.vaultbox.dto.*;
import com.vaultbox.exception.ResourceNotFoundException;
import com.vaultbox.model.FileMetadata;
import com.vaultbox.model.Folder;
import com.vaultbox.model.Role;
import com.vaultbox.model.User;
import com.vaultbox.repository.FileMetadataRepository;
import com.vaultbox.repository.FolderRepository;
import com.vaultbox.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for browsing folder contents with breadcrumb generation.
 */
@Service
@RequiredArgsConstructor
public class BrowseService {

    private final FolderRepository folderRepository;
    private final FileMetadataRepository fileRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    /**
     * Browse contents of a folder (or root level).
     * Returns folders, files, and breadcrumb path.
     *
     * @param parentId Parent folder ID, or null for root level
     * @param targetUserId User ID to browse (admin only, null for current user)
     */
    public BrowseResponse browse(String parentId, String targetUserId) {
        User currentUser = authService.getCurrentUser();
        String ownerId = resolveTargetUserId(currentUser, targetUserId);
        String normalizedParentId = normalizeId(parentId);

        FolderResponse currentFolder = null;
        List<BreadcrumbItem> breadcrumb = new ArrayList<>();
        breadcrumb.add(BreadcrumbItem.root());

        // If browsing inside a folder, validate access and build breadcrumb
        if (normalizedParentId != null) {
            Folder folder = folderRepository.findById(normalizedParentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Folder", "id", normalizedParentId));

            // Verify the folder belongs to the target user
            if (!folder.getOwnerId().equals(ownerId)) {
                throw new AccessDeniedException("Folder does not belong to the target user");
            }

            // Only check access if not admin or if viewing own folders
            if (currentUser.getRole() != Role.ADMIN && !folder.getOwnerId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You don't have permission to access this folder");
            }

            currentFolder = FolderResponse.from(folder, getOwnerEmail(folder.getOwnerId()));
            breadcrumb.addAll(buildBreadcrumb(folder));
        }

        // Get folders in this location
        List<Folder> folders = folderRepository.findByOwnerIdAndParentIdOrderByNameAsc(ownerId, normalizedParentId);
        List<FolderResponse> folderResponses = folders.stream()
                .map(f -> FolderResponse.from(f, getOwnerEmail(f.getOwnerId())))
                .collect(Collectors.toList());

        // Get files in this location
        List<FileMetadata> files = fileRepository.findByOwnerIdAndParentFolderIdOrderByOriginalNameAsc(ownerId, normalizedParentId);
        List<FileResponse> fileResponses = files.stream()
                .map(f -> FileResponse.from(f, getOwnerEmail(f.getOwnerId())))
                .collect(Collectors.toList());

        return BrowseResponse.builder()
                .currentFolder(currentFolder)
                .breadcrumb(breadcrumb)
                .folders(folderResponses)
                .files(fileResponses)
                .build();
    }

    /**
     * Builds breadcrumb path from root to the given folder.
     */
    private List<BreadcrumbItem> buildBreadcrumb(Folder folder) {
        List<BreadcrumbItem> breadcrumb = new ArrayList<>();

        // Traverse up the tree
        Folder current = folder;
        while (current != null) {
            breadcrumb.add(BreadcrumbItem.from(current.getId(), current.getName()));
            
            if (current.getParentId() != null) {
                current = folderRepository.findById(current.getParentId()).orElse(null);
            } else {
                current = null;
            }
        }

        // Reverse to get root-to-current order
        Collections.reverse(breadcrumb);
        return breadcrumb;
    }

    /**
     * Resolves target user ID for browse operations.
     */
    private String resolveTargetUserId(User currentUser, String targetUserId) {
        if (targetUserId == null || targetUserId.isBlank()) {
            return currentUser.getId();
        }

        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can browse other users' files");
        }

        // Verify target user exists
        if (!userRepository.existsById(targetUserId)) {
            throw new ResourceNotFoundException("User", "id", targetUserId);
        }

        return targetUserId;
    }

    private String normalizeId(String id) {
        return (id == null || id.isBlank()) ? null : id;
    }

    private String getOwnerEmail(String ownerId) {
        return userRepository.findById(ownerId)
                .map(User::getEmail)
                .orElse("Unknown");
    }
}


