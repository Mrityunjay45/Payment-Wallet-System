package Mrityunjay.wallet.system.controller;
import Mrityunjay.wallet.system.dto.LoginRequest;
import Mrityunjay.wallet.system.dto.LoginResponse;
import Mrityunjay.wallet.system.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/auth")
@Tag(
    name = "Authentication",
    description = "User authentication and JWT token generation"
)
public class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService){
        this.authService = authService;
    }
    @Operation(
    summary = "Login",
    description = "Authenticates a user and returns a JWT access token."
)
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }
}
