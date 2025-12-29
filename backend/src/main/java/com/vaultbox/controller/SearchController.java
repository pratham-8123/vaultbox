package com.vaultbox.controller;

import com.vaultbox.dto.SearchResponse;
import com.vaultbox.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    /**
     * Search files and folders by name.
     *
     * @param q      Search query (minimum 2 characters)
     * @param type   Filter: "file", "folder", or "all" (default: all)
     * @param userId Target user ID (admin only), null for current user
     * @param page   Page number (0-indexed, default: 0)
     * @param size   Page size (default: 20, max: 100)
     */
    @GetMapping
    public ResponseEntity<SearchResponse> search(
            @RequestParam String q,
            @RequestParam(required = false, defaultValue = "all") String type,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        
        SearchResponse response = searchService.search(q, type, userId, page, size);
        return ResponseEntity.ok(response);
    }
}


