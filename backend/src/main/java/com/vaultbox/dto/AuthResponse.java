package com.vaultbox.dto;

import com.vaultbox.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    private String tokenType;
    private UserDto user;

    @Data
    @Builder
    @AllArgsConstructor
    public static class UserDto {
        private String id;
        private String email;
        private String username;
        private Role role;
    }

    public static AuthResponse of(String token, String id, String email, String username, Role role) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(UserDto.builder()
                        .id(id)
                        .email(email)
                        .username(username)
                        .role(role)
                        .build())
                .build();
    }
}

