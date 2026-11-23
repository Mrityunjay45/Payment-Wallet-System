package Mrityunjay.wallet.system.controller;

import Mrityunjay.wallet.system.dto.ChangePasswordRequest;
import Mrityunjay.wallet.system.dto.UpdateProfileRequest;
import Mrityunjay.wallet.system.dto.UserProfileResponse;
import Mrityunjay.wallet.system.service.UserProfileService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        return ResponseEntity.ok(
                userProfileService.getMyProfile()
        );
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(
                userProfileService.updateMyProfile(request)
        );
    }

    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userProfileService.changePassword(request);
        return ResponseEntity.noContent().build();
    }
}
