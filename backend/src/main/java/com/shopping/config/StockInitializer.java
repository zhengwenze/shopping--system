package com.shopping.config;

import com.shopping.common.SeckillCacheKeys;
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
                    redisTemplate.opsForValue().set(SeckillCacheKeys.stockKey(Long.valueOf(String.valueOf(id))), String.valueOf(stock));
                }
            }

            List<Map<String, Object>> orders = jdbcTemplate.queryForList("SELECT user_id, product_id FROM order_info");
            for (Map<String, Object> order : orders) {
                Object userId = order.get("user_id");
                Object productId = order.get("product_id");
                if (userId != null && productId != null) {
                    redisTemplate.opsForValue().set(
                            SeckillCacheKeys.userOrderKey(
                                    Long.valueOf(String.valueOf(userId)),
                                    Long.valueOf(String.valueOf(productId))
                            ),
                            "1"
                    );
                    redisTemplate.opsForValue().set(
                            SeckillCacheKeys.resultKey(
                                    Long.valueOf(String.valueOf(userId)),
                                    Long.valueOf(String.valueOf(productId))
                            ),
                            "SUCCESS"
                    );
                }
            }
        };
    }
}
