package Mrityunjay.wallet.system.service;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.AuthorityUtils;

import Mrityunjay.wallet.system.entity.*;
import Mrityunjay.wallet.system.Repository.WalletRepository;
import Mrityunjay.wallet.system.dto.TransferRequest;
import Mrityunjay.wallet.system.Repository.TransactionRepository;
import Mrityunjay.wallet.system.exception.InsufficientBalanceException;
import Mrityunjay.wallet.system.dto.TransferRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private WalletService walletService;

    @BeforeEach
void setUp() {
    SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                    "wallet.test2026b@example.com",
                    null,
                    AuthorityUtils.createAuthorityList("ROLE_USER")
            )
    );
}
@AfterEach
void tearDown() {
    SecurityContextHolder.clearContext();
}

    @Test
void depositShouldIncreaseWalletBalance() {
    User user = new User();
    user.setId(12L);
    user.setEmail("wallet.test2026b@example.com");

    Wallet wallet = new Wallet();
    wallet.setId(1L);
    wallet.setUser(user);
    wallet.setBalance(new BigDecimal("500.00"));

    when(walletRepository.findByIdForUpdate(1L))
            .thenReturn(Optional.of(wallet));

    when(transactionRepository.save(any(Transaction.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

    Transaction result = walletService.deposit(
            1L, new BigDecimal("100.00")
    );

    assertEquals(
            new BigDecimal("600.00"),
            wallet.getBalance()
    );

    assertEquals(TransactionType.DEPOSIT, result.getType());
    assertEquals(TransactionStatus.SUCCESS, result.getStatus());

    verify(transactionRepository).save(any(Transaction.class));
}
@Test
void withdrawShouldDecreaseWalletBalance() {
    User user = new User();
    user.setId(12L);
    user.setEmail("wallet.test2026b@example.com");

    Wallet wallet = new Wallet();
    wallet.setId(1L);
    wallet.setUser(user);
    wallet.setBalance(new BigDecimal("500.00"));

    when(walletRepository.findByIdForUpdate(1L))
            .thenReturn(Optional.of(wallet));

    when(transactionRepository.save(any(Transaction.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

    Transaction result = walletService.withdraw(
            1L, new BigDecimal("100.00")
    );

    assertEquals(
            new BigDecimal("400.00"),
            wallet.getBalance()
    );

    assertEquals(TransactionType.WITHDRAWAL, result.getType());
    assertEquals(TransactionStatus.SUCCESS, result.getStatus());
}
@Test
void withdrawShouldFailWhenBalanceIsInsufficient() {

    User user = new User();
    user.setId(12L);
    user.setEmail("wallet.test2026b@example.com");

    Wallet wallet = new Wallet();
    wallet.setId(1L);
    wallet.setUser(user);
    wallet.setBalance(new BigDecimal("50.00"));

    when(walletRepository.findByIdForUpdate(1L))
            .thenReturn(Optional.of(wallet));

    assertThrows(
            InsufficientBalanceException.class,
            () -> walletService.withdraw(
                    1L,
                    new BigDecimal("100.00")
            )
    );

    assertEquals(
            new BigDecimal("50.00"),
            wallet.getBalance()
    );

    verify(transactionRepository, never())
            .save(any(Transaction.class));
}
@Test
void transferShouldUpdateBothWalletBalances() {

    User senderUser = new User();
    senderUser.setId(12L);
    senderUser.setEmail("wallet.test2026b@example.com");

    Wallet sender = new Wallet();
    sender.setId(1L);
    sender.setUser(senderUser);
    sender.setBalance(new BigDecimal("500.00"));

    Wallet receiver = new Wallet();
    receiver.setId(2L);
    receiver.setBalance(new BigDecimal("200.00"));

    when(walletRepository.findByIdForUpdate(1L))
            .thenReturn(Optional.of(sender));

    when(walletRepository.findByIdForUpdate(2L))
            .thenReturn(Optional.of(receiver));

    when(transactionRepository.save(any(Transaction.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

    TransferRequest request = new TransferRequest(
            2L,
            new BigDecimal("150.00")
    );

    Transaction result = walletService.transfer(1L, request);

    assertEquals(new BigDecimal("350.00"), sender.getBalance());
    assertEquals(new BigDecimal("350.00"), receiver.getBalance());

    assertEquals(TransactionType.TRANSFER, result.getType());
    assertEquals(TransactionStatus.SUCCESS, result.getStatus());

    assertEquals(sender, result.getSenderWallet());
    assertEquals(receiver, result.getReceiverWallet());

    verify(transactionRepository).save(any(Transaction.class));
}

@Test
void transferShouldFailWhenSenderHasInsufficientBalance() {
    User senderUser = new User();
    senderUser.setEmail("wallet.test2026b@example.com");

    Wallet sender = new Wallet();
    sender.setId(1L);
    sender.setUser(senderUser);
    sender.setBalance(new BigDecimal("50.00"));

    Wallet receiver = new Wallet();
    receiver.setId(2L);
    receiver.setBalance(new BigDecimal("200.00"));

    when(walletRepository.findByIdForUpdate(1L))
            .thenReturn(Optional.of(sender));
    when(walletRepository.findByIdForUpdate(2L))
            .thenReturn(Optional.of(receiver));

    TransferRequest request =
            new TransferRequest(2L, new BigDecimal("100.00"));

    assertThrows(
            InsufficientBalanceException.class,
            () -> walletService.transfer(1L, request)
    );

    assertEquals(new BigDecimal("50.00"), sender.getBalance());
    assertEquals(new BigDecimal("200.00"), receiver.getBalance());

    verify(transactionRepository, never()).save(any(Transaction.class));
}

@Test
void transferShouldFailWhenSenderAndReceiverAreSame() {
    TransferRequest request =
            new TransferRequest(1L, new BigDecimal("100.00"));

    assertThrows(
            IllegalArgumentException.class,
            () -> walletService.transfer(1L, request)
    );

    verify(walletRepository, never()).findByIdForUpdate(anyLong());
    verify(transactionRepository, never()).save(any(Transaction.class));
}

@Test
void transferShouldFailWhenReceiverWalletDoesNotExist() {
    User senderUser = new User();
    senderUser.setEmail("wallet.test2026b@example.com");

    Wallet sender = new Wallet();
    sender.setId(1L);
    sender.setUser(senderUser);
    sender.setBalance(new BigDecimal("500.00"));

    when(walletRepository.findByIdForUpdate(1L))
            .thenReturn(Optional.of(sender));
    when(walletRepository.findByIdForUpdate(2L))
            .thenReturn(Optional.empty());

    TransferRequest request =
            new TransferRequest(2L, new BigDecimal("100.00"));

    assertThrows(
            IllegalArgumentException.class,
            () -> walletService.transfer(1L, request)
    );

    assertEquals(new BigDecimal("500.00"), sender.getBalance());

    verify(transactionRepository, never()).save(any(Transaction.class));
}

}
