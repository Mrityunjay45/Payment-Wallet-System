package Mrityunjay.wallet.system.controller;
import Mrityunjay.wallet.system.dto.UserResponse;
import Mrityunjay.wallet.system.dto.RegisterRequest;
import Mrityunjay.wallet.system.service.UserService;
import Mrityunjay.wallet.system.entity.User;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping ("/api/users")
public class UserController {

    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }
    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        User user = userService.createUser(request);
        UserResponse response = new UserResponse(user.getId(), user.getName(), user.getEmail());

    return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
