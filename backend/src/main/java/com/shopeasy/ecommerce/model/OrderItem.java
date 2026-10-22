package com.shopeasy.ecommerce.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.TableGenerator;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "order_items")
public class OrderItem {

    @Id
    @TableGenerator(name = "order_items_generator", table = "shopeasy_id_sequences",
            pkColumnName = "sequence_name", valueColumnName = "next_val",
            pkColumnValue = "order_items", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.TABLE, generator = "order_items_generator")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @NotNull
    @Positive
    private Integer quantity;

    @NotNull
    @PositiveOrZero
    private BigDecimal unitPrice;
}
