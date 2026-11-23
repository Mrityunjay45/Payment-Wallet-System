package Mrityunjay.wallet.system.service;

import Mrityunjay.wallet.system.dto.ChangePasswordRequest;
import Mrityunjay.wallet.system.dto.UpdateProfileRequest;
import Mrityunjay.wallet.system.dto.UserProfileResponse;
import Mrityunjay.wallet.system.entity.User;
import Mrityunjay.wallet.system.Repository.UserRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private User getAuthenticatedUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getName() == null ||
                authentication.getName().equals("anonymousUser")) {

            throw new AccessDeniedException("Authentication required");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));
    }

    public UserProfileResponse getMyProfile() {
        User user = getAuthenticatedUser();

        return new UserProfileResponse(
                user.getName(),
                user.getEmail()
        );
    }

    @Transactional
    public UserProfileResponse updateMyProfile(
            UpdateProfileRequest request
    ) {
        User user = getAuthenticatedUser();

        user.setName(request.name().trim());

        User savedUser = userRepository.save(user);

        return new UserProfileResponse(
                savedUser.getName(),
                savedUser.getEmail()
        );
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {

        User user = getAuthenticatedUser();

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Current password is incorrect"
            );
        }

        if (request.currentPassword().equals(request.newPassword())) {
            throw new IllegalArgumentException(
                    "New password must be different from current password"
            );
        }

        user.setPassword(
                passwordEncoder.encode(request.newPassword())
        );

        userRepository.save(user);
    }
}
