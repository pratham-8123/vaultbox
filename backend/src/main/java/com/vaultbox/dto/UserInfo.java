package com.vaultbox.dto;

import com.vaultbox.model.Role;
import com.vaultbox.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO for user information (excludes sensitive fields like password).
 */
@Data
@Builder
@AllArgsConstructor
public class UserInfo {

    private String id;
    private String email;
    private String username;
    private Role role;
    private LocalDateTime createdAt;

    public static UserInfo from(User user) {
        return UserInfo.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}


