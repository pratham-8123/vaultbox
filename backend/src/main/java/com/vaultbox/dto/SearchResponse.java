package com.vaultbox.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Paginated search response.
 */
@Data
@Builder
@AllArgsConstructor
public class SearchResponse {

    private List<SearchResultItem> results;
    private long totalCount;
    private int page;
    private int size;
    private int totalPages;

    public static SearchResponse of(List<SearchResultItem> results, long totalCount, int page, int size) {
        int totalPages = (int) Math.ceil((double) totalCount / size);
        return SearchResponse.builder()
                .results(results)
                .totalCount(totalCount)
                .page(page)
                .size(size)
                .totalPages(totalPages)
                .build();
    }
}


