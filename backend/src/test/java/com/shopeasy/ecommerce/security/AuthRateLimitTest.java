package com.shopeasy.ecommerce.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import static org.junit.jupiter.api.Assertions.*;

class AuthRateLimitTest {
    @Test void boundsRepeatedAuthenticationAttempts() throws Exception {
        var filter = new AuthRateLimitFilter();
        for (int i = 0; i < 60; i++) {
            var request = new MockHttpServletRequest("POST", "/api/auth/login");
            request.setServletPath("/api/auth/login");
            var response = new MockHttpServletResponse();
            filter.doFilter(request, response, (req, res) -> {});
            assertEquals(200, response.getStatus());
        }
        var request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setServletPath("/api/auth/login");
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, (req, res) -> fail("Request must be blocked"));
        assertEquals(429, response.getStatus());
        assertEquals("60", response.getHeader("Retry-After"));
    }
}
