package com.shopeasy.ecommerce.mapper;

import com.shopeasy.ecommerce.dto.request.ProductRequest;
import com.shopeasy.ecommerce.dto.response.ProductResponse;
import com.shopeasy.ecommerce.model.Product;
import com.shopeasy.ecommerce.util.FormatUtil;
import java.util.Objects;

public class ProductMapper {

    public static Product toEntity(ProductRequest dto) {
        Objects.requireNonNull(dto, "ProductRequest não pode ser nulo");
        return Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .build();
    }

    public static ProductResponse toResponseDTO(Product p) {
        if (p == null) {
            return null;
        }
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stock(p.getStock())
                .category(p.getCategory())
                .imageUrl(p.getImageUrl())
                .createdAt(p.getCreatedAt() == null
                        ? null
                        : p.getCreatedAt().format(FormatUtil.DATE_TIME_FORMATTER))
                .build();
    }

    public static void updateEntity(Product p, ProductRequest dto) {
        if (p == null || dto == null) {
            return;
        }
        p.setName(dto.getName());
        p.setDescription(dto.getDescription());
        p.setPrice(dto.getPrice());
        p.setStock(dto.getStock());
    }
}
