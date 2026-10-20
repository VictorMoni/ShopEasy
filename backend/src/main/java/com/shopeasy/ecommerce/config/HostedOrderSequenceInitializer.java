package com.shopeasy.ecommerce.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Preserve existing order IDs while migrating away from keyless Hibernate sequences. */
@Component
@Profile("hosting")
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class HostedOrderSequenceInitializer implements ApplicationRunner {
    private final JdbcTemplate jdbc;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        jdbc.update("UPDATE shopeasy_id_sequences SET next_val = GREATEST(next_val, "
                + "(SELECT COALESCE(MAX(id), 0) + 1 FROM orders)) WHERE sequence_name = 'orders'");
        jdbc.update("UPDATE shopeasy_id_sequences SET next_val = GREATEST(next_val, "
                + "(SELECT COALESCE(MAX(id), 0) + 1 FROM order_items)) WHERE sequence_name = 'order_items'");
    }
}
