package com.shopeasy.ecommerce.security;

import com.shopeasy.ecommerce.config.DemoCatalogInitializer;
import com.shopeasy.ecommerce.model.Product;
import com.shopeasy.ecommerce.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class DemoCatalogTest {
    @Test void insertsSixProductsButNeverOverwritesExistingProducts() {
        var repository = mock(ProductRepository.class);
        var seed = new DemoCatalogInitializer(repository);
        seed.run(null);
        verify(repository, times(6)).save(argThat(p -> p.getImageUrl().startsWith("/products/") && p.getStock() == 30));
        clearInvocations(repository);
        when(repository.existsByName(anyString())).thenReturn(true);
        seed.run(null);
        verify(repository, never()).save(any(Product.class));
    }
}
