package Mrityunjay.wallet.system.service;
import Mrityunjay.wallet.system.entity.Wallet;
import Mrityunjay.wallet.system.Repository.WalletRepository;
import Mrityunjay.wallet.system.entity.Transaction;
import Mrityunjay.wallet.system.entity.TransactionStatus;
import Mrityunjay.wallet.system.entity.TransactionType;
import Mrityunjay.wallet.system.exception.InsufficientBalanceException;
import Mrityunjay.wallet.system.dto.TransactionResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import Mrityunjay.wallet.system.dto.TransferRequest;
import jakarta.transaction.Transactional;
import Mrityunjay.wallet.system.Repository.TransactionRepository;
import java.math.BigDecimal;
import Mrityunjay.wallet.system.dto.WalletResponse;
@Service
public class WalletService {
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    
    public WalletResponse getMyWallet() {
    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null ||
            !authentication.isAuthenticated() ||
            authentication.getName() == null) {
        throw new AccessDeniedException("Authentication required");
    }

    String email = authentication.getName();

    Wallet wallet = walletRepository.findByUser_Email(email)
            .orElseThrow(() ->
                    new IllegalArgumentException("Wallet not found"));

    return new WalletResponse(
            wallet.getId(),
            wallet.getBalance()
    );
}    
    public WalletService(WalletRepository walletRepository, TransactionRepository transactionRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }
    private void validateWalletOwnership(Wallet wallet) {
    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()) {
        throw new AccessDeniedException("Authentication required");
    }

    String authenticatedEmail = authentication.getName();
    String walletOwnerEmail = wallet.getUser().getEmail();

    if (!authenticatedEmail.equalsIgnoreCase(walletOwnerEmail)) {
        throw new AccessDeniedException(
                "You are not authorized to access this wallet"
        );
    }
}
    public Wallet createWallet(Wallet wallet) {
        return walletRepository.save(wallet);
    }
@Transactional
public Transaction withdraw(Long walletId, BigDecimal amount) {

    if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
        throw new IllegalArgumentException(
                "Withdrawal amount must be greater than zero"
        );
    }

    Wallet wallet = walletRepository.findByIdForUpdate(walletId)
        .orElseThrow(() ->
                new IllegalArgumentException("Wallet not found"));

    validateWalletOwnership(wallet);

    if (wallet.getBalance().compareTo(amount) < 0) {
        throw new InsufficientBalanceException(
                "Insufficient wallet balance"
        );
    }

    wallet.setBalance(wallet.getBalance().subtract(amount));

    Transaction transaction = new Transaction();
    transaction.setAmount(amount);
    transaction.setType(TransactionType.WITHDRAWAL);
    transaction.setStatus(TransactionStatus.SUCCESS);
    transaction.setSenderWallet(wallet);

    return transactionRepository.save(transaction);
}

@Transactional
public Transaction deposit(Long walletId, BigDecimal amount) {

    if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
        throw new IllegalArgumentException(
                "Deposit amount must be greater than zero"
        );
    }

   Wallet wallet = walletRepository.findByIdForUpdate(walletId)
        .orElseThrow(() ->
                new IllegalArgumentException("Wallet not found"));

    validateWalletOwnership(wallet);

    wallet.setBalance(wallet.getBalance().add(amount));

    Transaction transaction = new Transaction();
    transaction.setAmount(amount);
    transaction.setType(TransactionType.DEPOSIT);
    transaction.setStatus(TransactionStatus.SUCCESS);
    transaction.setReceiverWallet(wallet);

    return transactionRepository.save(transaction);
}
@Transactional
public Transaction transfer(
        Long senderWalletId,
        TransferRequest request
) {
    Long receiverWalletId = request.receiverWalletId();
    BigDecimal amount = request.amount();

    if (senderWalletId.equals(receiverWalletId)) {
        throw new IllegalArgumentException(
                "Cannot transfer money to the same wallet"
        );
    }

    if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
        throw new IllegalArgumentException(
                "Transfer amount must be greater than zero"
        );
    }
    Long firstWalletId = Math.min(senderWalletId, receiverWalletId);
    Long secondWalletId = Math.max(senderWalletId, receiverWalletId);

    Wallet firstWallet = walletRepository
            .findByIdForUpdate(firstWalletId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Wallet not found"));

    Wallet secondWallet = walletRepository
            .findByIdForUpdate(secondWalletId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Wallet not found"));

    Wallet senderWallet = senderWalletId.equals(firstWalletId)
            ? firstWallet : secondWallet;

    Wallet receiverWallet = receiverWalletId.equals(firstWalletId)
            ? firstWallet : secondWallet;

    validateWalletOwnership(senderWallet);

    if (senderWallet.getBalance().compareTo(amount) < 0) {
        throw new InsufficientBalanceException(
                "Insufficient wallet balance"
        );
    }
    senderWallet.setBalance(
            senderWallet.getBalance().subtract(amount)
    );

    receiverWallet.setBalance(
            receiverWallet.getBalance().add(amount)
    );

    Transaction transaction = new Transaction();
    transaction.setAmount(amount);
    transaction.setType(TransactionType.TRANSFER);
    transaction.setStatus(TransactionStatus.SUCCESS);
    transaction.setSenderWallet(senderWallet);
    transaction.setReceiverWallet(receiverWallet);

    return transactionRepository.save(transaction);
}
public Page<TransactionResponse> getTransactionHistory(
        Long walletId,
        int page,
        int size
) {
    if (page < 0 || size < 1 || size > 100) {
        throw new IllegalArgumentException("Invalid pagination parameters");
    }

    Wallet wallet = walletRepository.findById(walletId)
            .orElseThrow(() ->
                    new IllegalArgumentException("Wallet not found"));

    validateWalletOwnership(wallet);

    Pageable pageable = PageRequest.of(page, size);

    return transactionRepository
            .findTransactionsByWalletId(walletId, pageable)
            .map(TransactionResponse::from);
}

}
