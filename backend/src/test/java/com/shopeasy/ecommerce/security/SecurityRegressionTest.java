package com.shopeasy.ecommerce.security;

import com.shopeasy.ecommerce.model.Order;
import com.shopeasy.ecommerce.model.User;
import com.shopeasy.ecommerce.repository.OrderRepository;
import com.shopeasy.ecommerce.service.impl.OrderServiceImpl;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SecurityRegressionTest {
    @AfterEach void clearContext() { SecurityContextHolder.clearContext(); }

    @Test void separatesAccessAndRefreshTokens() {
        var jwt = new JwtUtil();
        jwt.setSecret("test-only-signing-key-with-at-least-32-bytes");
        jwt.setAccessTokenExpirationMs(60000);
        jwt.setRefreshTokenExpirationMs(120000);
        var user = org.springframework.security.core.userdetails.User.withUsername("alice")
                .password("unused").roles("USER").build();
        assertFalse(jwt.isRefreshToken(jwt.generateToken(user)));
        assertTrue(jwt.isRefreshToken(jwt.generateRefreshToken(user)));
        assertFalse(jwt.isRefreshToken("malformed"));
    }

    @Test void blocksReadingAnotherCustomersOrder() {
        var repository = mock(OrderRepository.class);
        var owner = User.builder().id(1L).username("alice").build();
        var order = new Order();
        order.setUser(owner);
        when(repository.findById(1L)).thenReturn(Optional.of(order));
        var service = new OrderServiceImpl(repository, null, null, null);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                "bob", "unused", List.of(new SimpleGrantedAuthority("ROLE_USER"))));
        assertThrows(AccessDeniedException.class, () -> service.findById(1L));
    }
}
