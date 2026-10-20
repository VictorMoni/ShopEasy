package com.shopeasy.ecommerce.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Small, bounded per-instance guard. Forwarded headers are deliberately not trusted. */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {
    private final Map<String, Bucket> buckets = new HashMap<>();
    private record Bucket(long window, int requests) {}

    private synchronized boolean allowed(String address) {
        long window = System.currentTimeMillis() / 60000;
        buckets.entrySet().removeIf(entry -> entry.getValue().window() != window);
        var bucket = buckets.get(address);
        if (bucket == null && buckets.size() >= 10000) return false;
        int count = bucket == null ? 0 : bucket.requests();
        if (count >= 60) return false;
        buckets.put(address, new Bucket(window, count + 1));
        return true;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if ("POST".equals(request.getMethod()) && request.getServletPath().startsWith("/api/auth/")
                && !allowed(request.getRemoteAddr())) {
            response.setStatus(429);
            response.setHeader("Retry-After", "60");
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Muitas tentativas. Aguarde um minuto.\"}");
            return;
        }
        chain.doFilter(request, response);
    }
}
