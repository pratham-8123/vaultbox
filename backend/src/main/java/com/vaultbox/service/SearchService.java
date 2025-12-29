package com.vaultbox.service;

import com.vaultbox.dto.SearchResponse;
import com.vaultbox.dto.SearchResultItem;
import com.vaultbox.exception.ResourceNotFoundException;
import com.vaultbox.model.FileMetadata;
import com.vaultbox.model.Folder;
import com.vaultbox.model.Role;
import com.vaultbox.model.User;
import com.vaultbox.repository.FileMetadataRepository;
import com.vaultbox.repository.FolderRepository;
import com.vaultbox.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Service for searching files and folders.
 */
@Service
@RequiredArgsConstructor
public class SearchService {

    private final FolderRepository folderRepository;
    private final FileMetadataRepository fileRepository;
    private final UserRepository userRepository;
    private final AuthService authService;

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    /**
     * Search for files and folders by name.
     *
     * @param query        Search term (minimum 2 characters)
     * @param type         Filter by type: "file", "folder", or "all"
     * @param targetUserId User ID to search (admin only), null for current user
     * @param page         Page number (0-indexed)
     * @param size         Page size
     */
    public SearchResponse search(String query, String type, String targetUserId, int page, int size) {
        if (query == null || query.length() < 2) {
            throw new IllegalArgumentException("Search query must be at least 2 characters");
        }

        User currentUser = authService.getCurrentUser();
        String ownerId = resolveTargetUserId(currentUser, targetUserId);

        // Normalize parameters
        String searchType = (type == null || type.isBlank()) ? "all" : type.toLowerCase();
        int pageSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, pageSize, Sort.by("name").ascending());

        List<SearchResultItem> results = new ArrayList<>();
        long totalCount = 0;

        // Search based on type filter
        if ("all".equals(searchType) || "folder".equals(searchType)) {
            SearchResult folderResults = searchFolders(ownerId, query, pageable);
            results.addAll(folderResults.items);
            totalCount += folderResults.totalCount;
        }

        if ("all".equals(searchType) || "file".equals(searchType)) {
            SearchResult fileResults = searchFiles(ownerId, query, pageable);
            results.addAll(fileResults.items);
            totalCount += fileResults.totalCount;
        }

        // Sort combined results: folders first, then files, alphabetically
        results.sort(Comparator
                .comparing((SearchResultItem item) -> item.getType() == SearchResultItem.ItemType.FILE ? 1 : 0)
                .thenComparing(SearchResultItem::getName, String.CASE_INSENSITIVE_ORDER));

        // Manual pagination for combined results
        // For type="all", we fetch from both collections and combine
        // This is a simplification; production would use aggregation pipeline
        int fromIndex = Math.min(page * pageSize, results.size());
        int toIndex = Math.min(fromIndex + pageSize, results.size());
        List<SearchResultItem> pagedResults = results.subList(fromIndex, toIndex);

        return SearchResponse.of(pagedResults, totalCount, page, pageSize);
    }

    private SearchResult searchFolders(String ownerId, String query, Pageable pageable) {
        Page<Folder> folderPage = folderRepository.findByOwnerIdAndNameContainingIgnoreCase(ownerId, query, pageable);
        
        List<SearchResultItem> items = folderPage.getContent().stream()
                .map(f -> SearchResultItem.fromFolder(f, getOwnerEmail(f.getOwnerId())))
                .toList();

        return new SearchResult(items, folderPage.getTotalElements());
    }

    private SearchResult searchFiles(String ownerId, String query, Pageable pageable) {
        Page<FileMetadata> filePage = fileRepository.findByOwnerIdAndOriginalNameContainingIgnoreCase(ownerId, query, pageable);

        List<SearchResultItem> items = filePage.getContent().stream()
                .map(f -> SearchResultItem.fromFile(f, getOwnerEmail(f.getOwnerId())))
                .toList();

        return new SearchResult(items, filePage.getTotalElements());
    }

    private String resolveTargetUserId(User currentUser, String targetUserId) {
        if (targetUserId == null || targetUserId.isBlank()) {
            return currentUser.getId();
        }

        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can search other users' files");
        }

        if (!userRepository.existsById(targetUserId)) {
            throw new ResourceNotFoundException("User", "id", targetUserId);
        }

        return targetUserId;
    }

    private String getOwnerEmail(String ownerId) {
        return userRepository.findById(ownerId)
                .map(User::getEmail)
                .orElse("Unknown");
    }

    /**
     * Simple container for search results with count.
     */
    private record SearchResult(List<SearchResultItem> items, long totalCount) {}
}


