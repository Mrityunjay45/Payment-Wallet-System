
package Mrityunjay.wallet.system.dto;

import Mrityunjay.wallet.system.entity.Transaction;
import Mrityunjay.wallet.system.entity.TransactionType;
import Mrityunjay.wallet.system.entity.TransactionStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(
    Long id,
    BigDecimal amount,
    TransactionType type,
    TransactionStatus status,
    LocalDateTime timestamp,
    Long senderWalletId,
    String senderName,
    Long receiverWalletId,
    String receiverName
) {
    public static TransactionResponse from(Transaction transaction) {

        var sender = transaction.getSenderWallet();
        var receiver = transaction.getReceiverWallet();

        return new TransactionResponse(
            transaction.getId(),
            transaction.getAmount(),
            transaction.getType(),
            transaction.getStatus(),
            transaction.getTimestamp(),

            sender != null ? sender.getId() : null,
            sender != null ? sender.getUser().getName() : null,

            receiver != null ? receiver.getId() : null,
            receiver != null ? receiver.getUser().getName() : null
        );
    }
}
