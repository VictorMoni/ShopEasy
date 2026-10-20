package com.shopeasy.ecommerce.service;

import com.shopeasy.ecommerce.dto.request.LoginRequest;
import com.shopeasy.ecommerce.dto.request.RefreshRequest;
import com.shopeasy.ecommerce.dto.request.RegisterRequest;
import com.shopeasy.ecommerce.dto.response.AuthResponse;
import com.shopeasy.ecommerce.dto.response.SuccessResponse;
import com.shopeasy.ecommerce.exception.BusinessException;
import com.shopeasy.ecommerce.exception.UnauthorizedException;
import com.shopeasy.ecommerce.model.User;
import com.shopeasy.ecommerce.security.CustomUserDetailsService;
import com.shopeasy.ecommerce.security.JwtUtil;
import com.shopeasy.ecommerce.service.impl.AuthServiceImpl;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @InjectMocks
    private AuthServiceImpl authService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private UserService userService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void shouldAuthenticateAndReturnTokens() {
        
        LoginRequest request = new LoginRequest("fulano", "1234");

        Authentication auth = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(userDetails)).thenReturn("refresh-token");

        AuthResponse response = authService.login(request);

        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void shouldThrowUnauthorizedException_WhenLoginFails() {
        LoginRequest request = new LoginRequest("fulano", "errado");

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Credenciais inválidas"));

        UnauthorizedException ex = assertThrows(
                UnauthorizedException.class,
                () -> authService.login(request));

        assertEquals("Usuário ou senha inválidos", ex.getMessage());
    }

    @Test
    void shouldRefreshTokenSuccessfully() {
        RefreshRequest request = new RefreshRequest("valid-refresh-token");
        String username = "fulano";
        UserDetails userDetails = mock(UserDetails.class);

        when(jwtUtil.isTokenValid("valid-refresh-token")).thenReturn(true);
        when(jwtUtil.getUsernameFromToken("valid-refresh-token")).thenReturn(username);
        when(userDetailsService.loadUserByUsername(username)).thenReturn(userDetails);
        when(jwtUtil.generateToken(userDetails)).thenReturn("new-access-token");

        AuthResponse response = authService.refresh(request);

        assertEquals("new-access-token", response.getAccessToken());
        assertEquals("valid-refresh-token", response.getRefreshToken());
    }

    @Test
    void shouldThrowUnauthorizedException_WhenRefreshTokenInvalid() {
        RefreshRequest request = new RefreshRequest("invalid-token");

        when(jwtUtil.isTokenValid("invalid-token")).thenReturn(false);

        UnauthorizedException ex = assertThrows(
                UnauthorizedException.class,
                () -> authService.refresh(request));

        assertEquals("Token inválido ou expirado", ex.getMessage());
    }

    @Test
    void shouldRegisterUserSuccessfully() {
        RegisterRequest request = new RegisterRequest("fulano", "senha123", "USER");

        when(userService.findByUsername("fulano")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("senha123")).thenReturn("senhaCodificada");

        SuccessResponse response = authService.register(request);

        assertEquals("Usuário registrado com sucesso", response.getMessage());
        verify(userService).save(any(User.class));
    }

    @Test
    void shouldThrowBusinessException_WhenUsernameExists() {
        RegisterRequest request = new RegisterRequest("fulano", "senha123", "USER");

        when(userService.findByUsername("fulano")).thenReturn(Optional.of(new User()));

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> authService.register(request));

        assertEquals("Usuário já existe", ex.getMessage());
    }

    @Test
    void shouldThrowBusinessException_WhenUsernameOrPasswordBlank() {
        RegisterRequest request = new RegisterRequest(" ", " ", "USER");

        BusinessException ex = assertThrows(
                BusinessException.class,
                () -> authService.register(request));

        assertEquals("Usuário e senha são obrigatórios", ex.getMessage());
    }
    @Test
    void hostingMustRejectPublicAdminRegistration() {
        org.springframework.test.util.ReflectionTestUtils.setField(authService, "allowAdminRegistration", false);
        var request = new RegisterRequest("public-admin", "unused-test-password", "ADMIN");
        assertThrows(BusinessException.class, () -> authService.register(request));
        org.mockito.Mockito.verifyNoInteractions(userService, passwordEncoder);
    }
}
