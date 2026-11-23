
package Mrityunjay.wallet.system.integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registrationAndLoginShouldWork() throws Exception {

        // Generate unique email so repeated test runs don't conflict.
        String email = "integration-" + UUID.randomUUID()
                + "@example.com";

        String password = "Password123";

        // 1. Register user
        String registerJson = """
                {
                    "name": "Integration Test User",
                    "email": "%s",
                    "password": "%s"
                }
                """.formatted(email, password);

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerJson))
                .andExpect(status().is2xxSuccessful());

        // 2. Login user
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
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(900))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // 3. Extract JWT
        java.util.regex.Matcher matcher =
        java.util.regex.Pattern
                .compile("\"accessToken\"\\s*:\\s*\"([^\"]+)\"")
                .matcher(response);

org.junit.jupiter.api.Assertions.assertTrue(
        matcher.find(), "JWT access token not found"
);

String accessToken = matcher.group(1);

org.junit.jupiter.api.Assertions.assertFalse(accessToken.isBlank());

        // 4. Verify token is present
        org.junit.jupiter.api.Assertions.assertFalse(
                accessToken.isBlank()
        );
    }
}
