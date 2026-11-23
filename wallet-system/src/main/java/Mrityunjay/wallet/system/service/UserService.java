package Mrityunjay.wallet.system.service;

import Mrityunjay.wallet.system.entity.User;
import Mrityunjay.wallet.system.dto.RegisterRequest;
import Mrityunjay.wallet.system.Repository.UserRepository;
import Mrityunjay.wallet.system.entity.Wallet;
import Mrityunjay.wallet.system.Repository.WalletRepository;

import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service

public class UserService {
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, WalletRepository walletRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
    }
     
@Transactional
public User createUser(RegisterRequest request) {

    String email = request.getEmail().trim();

    if (userRepository.findByEmail(email).isPresent()) {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Email is already registered"
        );
    }

    User user = new User();
    user.setName(request.getName().trim());
    user.setEmail(email);
    user.setPassword(
            passwordEncoder.encode(request.getPassword())
    );

    User savedUser = userRepository.save(user);

    Wallet wallet = new Wallet();
    wallet.setUser(savedUser);
    wallet.setBalance(BigDecimal.ZERO);
    walletRepository.save(wallet);

    return savedUser;
}

}
