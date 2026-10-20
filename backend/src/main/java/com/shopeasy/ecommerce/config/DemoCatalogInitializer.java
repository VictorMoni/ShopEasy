package com.shopeasy.ecommerce.config;

import com.shopeasy.ecommerce.model.Product;
import com.shopeasy.ecommerce.repository.ProductRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Idempotent sample catalog for the hosted portfolio demonstration. Never creates credentials. */
@Component
@Profile("hosting")
@RequiredArgsConstructor
public class DemoCatalogInitializer implements ApplicationRunner {
    private final ProductRepository products;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        add("Fone Aurora", "Áudio", "Fone sem fio com almofadas confortáveis e acabamento verde. Produto demonstrativo.", "249.90", "headphones");
        add("Mochila Horizonte", "Acessórios", "Mochila compacta para acompanhar trabalho, estudo e pequenos passeios. Produto demonstrativo.", "189.90", "backpack");
        add("Luminária Arco", "Casa", "Luminária de mesa com linhas suaves e luz para o seu espaço de leitura. Produto demonstrativo.", "159.90", "lamp");
        add("Garrafa Brisa", "Dia a dia", "Garrafa reutilizável de 600 ml com tampa de rosca e acabamento fosco. Produto demonstrativo.", "79.90", "bottle");
        add("Tênis Caminho", "Moda", "Tênis casual em tons claros para combinar com os seus dias. Produto demonstrativo.", "229.90", "sneakers");
        add("Caderno Essencial", "Papelaria", "Caderno de capa rígida com 160 páginas para ideias e planos. Produto demonstrativo.", "39.90", "notebook");
    }

    private void add(String name, String category, String description, String price, String image) {
        if (products.existsByName(name)) return;
        products.save(Product.builder().name(name).category(category).description(description)
                .price(new BigDecimal(price)).stock(30).imageUrl("/products/" + image + ".svg").build());
    }
}
