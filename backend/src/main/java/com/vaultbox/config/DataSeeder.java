package com.vaultbox.config;

import com.vaultbox.model.FileMetadata;
import com.vaultbox.model.Role;
import com.vaultbox.model.User;
import com.vaultbox.repository.FileMetadataRepository;
import com.vaultbox.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FileMetadataRepository fileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        seedAdminUser();
        migrateExistingFiles();
    }

    private void seedAdminUser() {
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin user already exists, skipping seed");
            return;
        }

        User admin = User.builder()
                .email(adminEmail)
                .username("admin")
                .password(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .build();

        userRepository.save(admin);
        log.info("Admin user created: {}", adminEmail);
    }

    /**
     * Migrates existing files that don't have path information.
     * Sets them to root level with path = /filename
     */
    private void migrateExistingFiles() {
        List<FileMetadata> filesWithoutPath = fileRepository.findFilesWithoutPath();
        
        if (filesWithoutPath.isEmpty()) {
            return;
        }

        log.info("Migrating {} files without path information", filesWithoutPath.size());

        for (FileMetadata file : filesWithoutPath) {
            // Set file at root level
            file.setParentFolderId(null);
            file.setPath("/" + file.getOriginalName());
            fileRepository.save(file);
        }

        log.info("File migration completed");
    }
}
