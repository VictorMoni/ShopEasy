package com.shopeasy.ecommerce.model;

import com.shopeasy.ecommerce.dto.request.ProductRequest;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 100, message = "Máx. 100 caracteres")
    private String name;

    @Size(max = 1000, message = "Máx. 1000 caracteres")
    private String description;

    @NotNull(message = "O preço é obrigatório")
    @PositiveOrZero(message = "Preço deve ser ≥ 0")
    @Column(nullable = false)
    private BigDecimal price;

    @NotNull(message = "O estoque é obrigatório")
    @Min(value = 0, message = "Estoque deve ser ≥ 0")
    @Column(nullable = false)
    private Integer stock;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    private String category;

    private String imageUrl;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public void updateFrom(ProductRequest dto) {
        this.setName(dto.getName());
        this.setDescription(dto.getDescription());
        this.setPrice(dto.getPrice());
        this.setStock(dto.getStock());
    }
}
