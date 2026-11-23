package Mrityunjay.wallet.system.Repository;

import Mrityunjay.wallet.system.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    @Query("""
        SELECT t FROM Transaction t
        WHERE t.senderWallet.id = :walletId
           OR t.receiverWallet.id = :walletId
        ORDER BY t.timestamp DESC
        """)
    Page<Transaction> findTransactionsByWalletId(
            @Param("walletId") Long walletId,
            Pageable pageable
    );
}
