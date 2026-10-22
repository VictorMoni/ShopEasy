package com.shopeasy.ecommerce.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import static org.junit.jupiter.api.Assertions.*;

class SecurityCorsTest {
    @Test
    void permitsBothLocalFrontendHostsAndRejectsUnlistedOrigins() {
        var source = new SecurityConfig(null).corsConfigurationSource();
        var request = new MockHttpServletRequest("OPTIONS", "/api/auth/login");
        var config = source.getCorsConfiguration(request);
        assertNotNull(config);
        assertEquals("http://localhost:4200", config.checkOrigin("http://localhost:4200"));
        assertEquals("http://127.0.0.1:4200", config.checkOrigin("http://127.0.0.1:4200"));
        assertNull(config.checkOrigin("https://untrusted.example"));
    }
}
