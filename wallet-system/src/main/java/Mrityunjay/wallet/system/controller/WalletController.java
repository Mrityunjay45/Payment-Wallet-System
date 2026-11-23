package Mrityunjay.wallet.system.controller;
import Mrityunjay.wallet.system.dto.WalletOperationRequest;
import Mrityunjay.wallet.system.entity.Transaction;
import Mrityunjay.wallet.system.service.WalletService;
import Mrityunjay.wallet.system.dto.TransactionResponse;
import org.springframework.data.domain.Page;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import Mrityunjay.wallet.system.dto.WalletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import Mrityunjay.wallet.system.dto.TransferRequest;
@RestController
@RequestMapping("/api/wallets")
@Tag(
    name = "Wallet Operations",
    description = "Deposit, withdrawal, transfer and transaction history APIs"
)
@SecurityRequirement(name = "bearerAuth")
public class WalletController {
    private final WalletService walletService;

    public WalletController(WalletService walletService){
        this.walletService = walletService;
    }
    @Operation(
    summary = "Get my wallet",
    description = "Returns the authenticated user's wallet ID and balance."
    )
    @GetMapping("/me")
        public ResponseEntity<WalletResponse> getMyWallet() {
        return ResponseEntity.ok(walletService.getMyWallet());
    }
      @Operation(
    summary = "Deposit money",
    description = "Adds money to the authenticated user's wallet."
)
    @PostMapping("/{walletId}/deposit")
     public ResponseEntity<Transaction> deposit(
            @PathVariable Long walletId,
            @Valid @RequestBody WalletOperationRequest request) {

        Transaction transaction = walletService.deposit(
                walletId, request.getAmount());
                
        return ResponseEntity.ok(transaction);
    }
  
        @Operation(
    summary = "Withdraw money",
    description = "Withdraws money after checking wallet ownership and available balance."
)
    @PostMapping("/{walletId}/withdraw")
    public ResponseEntity<Transaction> withdraw(
            @PathVariable Long walletId,
            @Valid @RequestBody WalletOperationRequest request) {
        
        Transaction transaction = walletService.withdraw(
                walletId, request.getAmount());

        return ResponseEntity.ok(transaction);
    }
    @Operation(
    summary = "Get transaction history",
    description = "Returns paginated transaction history for the authenticated wallet owner."
)
    @GetMapping("/{walletId}/transactions")
        public ResponseEntity<Page<TransactionResponse>> getTransactionHistory(
                @PathVariable Long walletId,
                @RequestParam(defaultValue = "0") int page,
                @RequestParam(defaultValue = "10") int size
        ) {
            return ResponseEntity.ok(
                    walletService.getTransactionHistory(walletId, page, size)
            );
        }
        @Operation(
    summary = "Transfer money",
    description = "Transfers money between wallets with balance validation and database locking."
)
        @PostMapping("/{walletId}/transfer")
        public ResponseEntity<TransactionResponse> transfer(
                @PathVariable Long walletId,
                @Valid @RequestBody TransferRequest request
        ) {
            Transaction transaction = walletService.transfer(walletId, request);

            return ResponseEntity.ok(
                    TransactionResponse.from(transaction)
            );
        }
}
