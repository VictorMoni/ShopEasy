package com.shopeasy.ecommerce.controller;

import com.shopeasy.ecommerce.api.OrderApi;
import com.shopeasy.ecommerce.dto.request.OrderRequest;
import com.shopeasy.ecommerce.dto.response.OrderResponse;
import com.shopeasy.ecommerce.model.OrderStatus;
import com.shopeasy.ecommerce.service.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
@Tag(name = "Pedidos", description = "Operações de gerenciamento de pedidos")
public class OrderController implements OrderApi {

    private final OrderService orderService;

    @Override
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<OrderResponse> list() {
        log.info("📦 Listando todos os pedidos (admin)");
        return orderService.list();
    }

    @Override
    @GetMapping("/me")
    public ResponseEntity<Page<OrderResponse>> findMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        String username = userDetails.getUsername();
        log.info("📄 Listando pedidos do usuário: {}", username);

        Pageable pageable = orderPage(page, size, sortBy, direction);

        return ResponseEntity.ok(orderService.findByUser(username, pageable));
    }

    @Override
    @GetMapping("/{id}")
    public OrderResponse findById(@PathVariable Long id) {
        log.info("🔎 Buscando pedido por ID: {}", id);
        return orderService.findById(id);
    }

    @Override
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<OrderResponse>> findByStatus(
            @PathVariable OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        log.info("📊 Listando pedidos com status: {}", status);
        Pageable pageable = orderPage(page, size, sortBy, direction);

        return ResponseEntity.ok(orderService.findByStatus(status, pageable));
    }

    @Override
    @PostMapping
    public ResponseEntity<OrderResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OrderRequest request) {

        String username = userDetails.getUsername();
        log.info("📝 Criando pedido para usuário: {}", username);

        return ResponseEntity.ok(orderService.create(username, request));
    }

    @Override
    @PutMapping("/{id}")
    public ResponseEntity<OrderResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody OrderRequest request) {

        String username = userDetails.getUsername();
        log.info("✏️ Atualizando pedido {} para usuário: {}", id, username);

        return ResponseEntity.ok(orderService.update(username, id, request));
    }

    @Override
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.warn("❌ Excluindo pedido com ID: {}", id);
        orderService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private Pageable orderPage(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return PageRequest.of(page, size, sort);
    }
}
