package com.shopeasy.ecommerce.integration;

import com.shopeasy.ecommerce.security.JwtUtil;
import com.shopeasy.ecommerce.repository.UserRepository;
import com.shopeasy.ecommerce.model.User;
import com.shopeasy.ecommerce.model.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityBoundaryTest {
    @Autowired MockMvc mvc;
    @Autowired JwtUtil jwt;
    @Autowired UserRepository users;

    @Test void refreshTokenCannotBeUsedAsBearerAndCustomerCannotPublishKafkaEvents() throws Exception {
        users.save(User.builder().username("boundary-user").password("unused-hash").role(Role.USER).build());
        var principal = org.springframework.security.core.userdetails.User.withUsername("boundary-user")
                .password("unused").roles("USER").build();
        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + jwt.generateRefreshToken(principal)))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/kafka").param("status", "NEW")
                .header("Authorization", "Bearer " + jwt.generateToken(principal)))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/auth/refresh").contentType("application/json")
                .content("{\"refreshToken\":\"" + jwt.generateToken(principal) + "\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test void rejectsNegativeNestedOrderQuantity() throws Exception {
        users.save(User.builder().username("quantity-user").password("unused-hash").role(Role.USER).build());
        var principal = org.springframework.security.core.userdetails.User.withUsername("quantity-user")
                .password("unused").roles("USER").build();
        mvc.perform(post("/api/orders").header("Authorization", "Bearer " + jwt.generateToken(principal))
                .contentType("application/json").content("{\"items\":[{\"productId\":1,\"quantity\":-1}]}"))
                .andExpect(status().isBadRequest());
    }
}
