package com.vaultbox.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FolderRequest {

    @NotBlank(message = "Folder name is required")
    @Size(min = 1, max = 100, message = "Folder name must be between 1 and 100 characters")
    @Pattern(regexp = "^[^/\\\\:*?\"<>|]+$", message = "Folder name contains invalid characters")
    private String name;

    /**
     * Parent folder ID. Null or empty creates folder at root level.
     */
    private String parentId;
}


