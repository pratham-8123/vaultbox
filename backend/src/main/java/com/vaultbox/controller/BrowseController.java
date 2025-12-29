package com.vaultbox.controller;

import com.vaultbox.dto.BrowseResponse;
import com.vaultbox.service.BrowseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/browse")
@RequiredArgsConstructor
public class BrowseController {

    private final BrowseService browseService;

    /**
     * Browse folder contents.
     *
     * @param parentId Folder ID to browse, or null/empty for root level
     * @param userId   Target user ID (admin only), or null for current user
     */
    @GetMapping
    public ResponseEntity<BrowseResponse> browse(
            @RequestParam(required = false) String parentId,
            @RequestParam(required = false) String userId) {
        BrowseResponse response = browseService.browse(parentId, userId);
        return ResponseEntity.ok(response);
    }
}


