package com.vaultbox.service;

import com.vaultbox.dto.UserInfo;
import com.vaultbox.model.Role;
import com.vaultbox.model.User;
import com.vaultbox.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for user-related operations.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    /**
     * Lists all users. Admin only.
     */
    public List<UserInfo> listUsers() {
        User currentUser = authService.getCurrentUser();

        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can list users");
        }

        return userRepository.findAll().stream()
                .map(UserInfo::from)
                .collect(Collectors.toList());
    }
}


