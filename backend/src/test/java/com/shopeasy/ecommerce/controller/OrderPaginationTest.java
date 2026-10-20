package com.shopeasy.ecommerce.controller;

import com.shopeasy.ecommerce.model.OrderStatus;
import com.shopeasy.ecommerce.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.User;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class OrderPaginationTest {
    private final OrderService service = mock(OrderService.class);
    private final OrderController controller = new OrderController(service);

    @Test
    void userOrdersPreservePageSizeAndCaseInsensitiveDescendingSort() {
        var page = PageRequest.of(2, 5, Sort.by("id").descending());
        var response = Page.<com.shopeasy.ecommerce.dto.response.OrderResponse>empty(page);
        when(service.findByUser("cliente", page)).thenReturn(response);
        var user = User.withUsername("cliente").password("unused").roles("USER").build();
        assertEquals(response, controller.findMyOrders(user, 2, 5, "id", "DESC").getBody());
        verify(service).findByUser("cliente", page);
    }

    @Test
    void statusOrdersPreserveAscendingFallbackForOtherDirections() {
        var page = PageRequest.of(0, 10, Sort.by("createdAt").ascending());
        var response = Page.<com.shopeasy.ecommerce.dto.response.OrderResponse>empty(page);
        when(service.findByStatus(OrderStatus.NEW, page)).thenReturn(response);
        assertEquals(response, controller.findByStatus(OrderStatus.NEW, 0, 10, "createdAt", "asc").getBody());
        verify(service).findByStatus(OrderStatus.NEW, page);
    }
}
