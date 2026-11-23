
package Mrityunjay.wallet.system.integration;

import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WalletIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntityManager entityManager;

    private final String password = "Password123";

    private String registerAndLogin(String email, String name)
            throws Exception {

        String registerJson = """
                {
                    "name": "%s",
                    "email": "%s",
                    "password": "%s"
                }
                """.formatted(name, email, password);

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().is2xxSuccessful());

        String loginJson = """
                {
                    "email": "%s",
                    "password": "%s"
                }
                """.formatted(email, password);

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginJson))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Pattern pattern =
                Pattern.compile("\"accessToken\"\\s*:\\s*\"([^\"]+)\"");

        Matcher matcher = pattern.matcher(response);

        assertTrue(matcher.find(), "Access token was not returned");

        return matcher.group(1);
    }

    private Long getWalletId(String email) {

        return entityManager.createQuery(
                "SELECT w.id FROM Wallet w WHERE w.user.email = :email",
                Long.class
        ).setParameter("email", email)
         .getSingleResult();
    }

    private BigDecimal getWalletBalance(Long walletId) {

        return entityManager.createQuery(
                "SELECT w.balance FROM Wallet w WHERE w.id = :id",
                BigDecimal.class
        ).setParameter("id", walletId)
         .getSingleResult();
    }

    @Test
    void depositAndTransferShouldUpdateDatabaseBalances()
            throws Exception {

        String suffix = UUID.randomUUID().toString();

        String senderEmail = "sender-" + suffix + "@example.com";
        String receiverEmail = "receiver-" + suffix + "@example.com";

        // 1. Register both users and obtain JWT tokens.
        String senderToken =
                registerAndLogin(senderEmail, "Sender");

        String receiverToken =
                registerAndLogin(receiverEmail, "Receiver");

        // 2. Retrieve wallet IDs from PostgreSQL.
        Long senderWalletId = getWalletId(senderEmail);
        Long receiverWalletId = getWalletId(receiverEmail);

        // 3. Deposit 500 into sender's wallet.
        String depositJson = """
                {
                    "amount": 500.00
                }
                """;

        mockMvc.perform(post(
                        "/api/wallets/" + senderWalletId + "/deposit")
                        .header("Authorization", "Bearer " + senderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(depositJson))
                .andExpect(status().isOk());

        // 4. Transfer 150 to receiver's wallet.
        String transferJson = """
                {
                    "receiverWalletId": %d,
                    "amount": 150.00
                }
                """.formatted(receiverWalletId);

        mockMvc.perform(post(
                        "/api/wallets/" + senderWalletId + "/transfer")
                        .header("Authorization", "Bearer " + senderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(transferJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("TRANSFER"))
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.amount").value(150.00));

        // 5. Verify actual PostgreSQL balances.
        entityManager.clear();

        assertEquals(
                0,
                new BigDecimal("350.00")
                        .compareTo(getWalletBalance(senderWalletId))
        );

        assertEquals(
                0,
                new BigDecimal("150.00")
                        .compareTo(getWalletBalance(receiverWalletId))
        );
    }

@Test
void userCannotAccessAnotherUsersWallet() throws Exception {

    String suffix = UUID.randomUUID().toString();

    String ownerEmail = "owner-" + suffix + "@example.com";
    String attackerEmail = "other-" + suffix + "@example.com";

    // Create wallet owner.
    registerAndLogin(ownerEmail, "Owner");

    // Create second user and obtain their JWT.
    String otherToken =
            registerAndLogin(attackerEmail, "Other User");

    Long ownerWalletId = getWalletId(ownerEmail);

    // Attempt to deposit into another user's wallet.
    mockMvc.perform(post(
                    "/api/wallets/" + ownerWalletId + "/deposit")
                    .header("Authorization", "Bearer " + otherToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                            {
                                "amount": 100.00
                            }
                            """))
            .andExpect(status().isForbidden());

    // Confirm balance remains unchanged.
    entityManager.clear();

    assertEquals(
            0,
            BigDecimal.ZERO.compareTo(
                    getWalletBalance(ownerWalletId)
            )
    );
}

}
