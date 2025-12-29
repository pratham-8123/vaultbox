package com.vaultbox.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Response for the browse endpoint.
 * Contains current folder info, breadcrumb path, and folder contents.
 */
@Data
@Builder
@AllArgsConstructor
public class BrowseResponse {

    /**
     * Current folder info. Null if at root level.
     */
    private FolderResponse currentFolder;

    /**
     * Breadcrumb path from root to current folder.
     */
    private List<BreadcrumbItem> breadcrumb;

    /**
     * Subfolders in the current folder.
     */
    private List<FolderResponse> folders;

    /**
     * Files in the current folder.
     */
    private List<FileResponse> files;
}


