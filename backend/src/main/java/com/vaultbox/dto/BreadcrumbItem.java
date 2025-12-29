package com.vaultbox.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class BreadcrumbItem {

    /**
     * Folder ID. Null represents the root level.
     */
    private String id;

    private String name;

    /**
     * Creates the root breadcrumb item.
     */
    public static BreadcrumbItem root() {
        return new BreadcrumbItem(null, "Root");
    }

    public static BreadcrumbItem from(String id, String name) {
        return new BreadcrumbItem(id, name);
    }
}


