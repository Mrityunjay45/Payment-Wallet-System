package Mrityunjay.wallet.system.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {}
