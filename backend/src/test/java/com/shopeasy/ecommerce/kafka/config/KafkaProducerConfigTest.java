package com.shopeasy.ecommerce.kafka.config;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import static org.junit.jupiter.api.Assertions.assertEquals;

class KafkaProducerConfigTest {
    @Test
    void carriesManagedBrokerAuthenticationIntoProducerConfiguration() {
        var properties = new KafkaProperties();
        properties.setBootstrapServers(List.of("broker.example:9092"));
        properties.getProperties().put("security.protocol", "SASL_SSL");
        properties.getProperties().put("sasl.mechanism", "SCRAM-SHA-256");
        var factory = (DefaultKafkaProducerFactory<?, ?>) new KafkaProducerConfig(properties).producerFactory();
        var config = factory.getConfigurationProperties();
        assertEquals("SASL_SSL", config.get("security.protocol"));
        assertEquals("SCRAM-SHA-256", config.get("sasl.mechanism"));
        assertEquals(List.of("broker.example:9092"), config.get("bootstrap.servers"));
    }
}
