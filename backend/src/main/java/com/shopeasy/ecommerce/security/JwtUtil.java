package com.shopeasy.ecommerce.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.validation.constraints.NotBlank;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Data
@Component
@ConfigurationProperties(prefix = "jwt")
public class JwtUtil {

    @NotBlank
    private String secret;
    private long accessTokenExpirationMs;
    private long refreshTokenExpirationMs;

    public SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(UserDetails user) {
        return Jwts.builder()
                .subject(user.getUsername())
                .claim("token_use", "access")
                .claim("roles", user.getAuthorities()
                        .stream().map(GrantedAuthority::getAuthority).toList())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .claim("token_use", "refresh")
                .claim("roles", userDetails.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String getUsernameFromToken(String token) {
        return extractAllClaims(token).getSubject();
    }

    public List<String> getRolesFromToken(String token) {
        Claims claims = extractAllClaims(token);
        Object rolesObj = claims.get("roles");

        if (rolesObj instanceof List<?>) {
            List<?> roles = (List<?>) rolesObj;
            return roles.stream()
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }

        return Collections.emptyList();
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public boolean isTokenExpired(String token) {
        Date expiration = extractAllClaims(token).getExpiration();
        return expiration.before(new Date());
    }

    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(extractAllClaims(token).get("token_use", String.class));
        } catch (Exception ex) {
            return false;
        }
    }

    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
