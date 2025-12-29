package com.vaultbox.controller;

import com.vaultbox.dto.UserInfo;
import com.vaultbox.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * List all users (admin only).
     * Used for the admin user selector dropdown.
     */
    @GetMapping
    public ResponseEntity<List<UserInfo>> listUsers() {
        List<UserInfo> users = userService.listUsers();
        return ResponseEntity.ok(users);
    }
}


