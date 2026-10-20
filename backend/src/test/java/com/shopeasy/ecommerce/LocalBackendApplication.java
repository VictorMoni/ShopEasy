package com.shopeasy.ecommerce;

import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.kafka.test.EmbeddedKafkaKraftBroker;

/** Opt-in local browser smoke environment: real API, ephemeral H2 and Kafka. */
public final class LocalBackendApplication {
    public static void main(String[] args) {
        var broker = new EmbeddedKafkaKraftBroker(1, 1, "order-events");
        broker.brokerListProperty("spring.kafka.bootstrap-servers");
        broker.afterPropertiesSet();
        Runtime.getRuntime().addShutdownHook(new Thread(broker::destroy));
        System.setProperty("spring.h2.console.enabled", "false");
        var app = new SpringApplication(EcommerceApplication.class);
        app.setAdditionalProfiles("test");
        app.setDefaultProperties(Map.of(
            "server.address", "127.0.0.1",
            "server.port", "8080"
        ));
        app.run(args);
    }
}
