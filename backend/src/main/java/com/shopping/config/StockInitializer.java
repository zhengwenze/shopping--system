package com.shopping.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

@Configuration
public class StockInitializer {

    @Bean
    public ApplicationRunner preloadStockCache(JdbcTemplate jdbcTemplate, StringRedisTemplate redisTemplate) {
        return args -> {
            List<Map<String, Object>> products = jdbcTemplate.queryForList("SELECT id, stock FROM product");
            for (Map<String, Object> product : products) {
                Object id = product.get("id");
                Object stock = product.get("stock");
                if (id != null && stock != null) {
                    redisTemplate.opsForValue().set("seckill:stock:" + id, String.valueOf(stock));
                }
            }
        };
    }
}
