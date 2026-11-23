package Mrityunjay.wallet.system.dto;

import java.math.BigDecimal;

public record WalletResponse(
        Long walletId,
        BigDecimal balance
) {}
