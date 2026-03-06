package com.shopping.mq;

import com.shopping.common.SeckillCacheKeys;
import com.shopping.model.OrderMessage;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class OrderConsumer {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Transactional
    @RabbitListener(queues = MQConfig.SECKILL_ORDER_QUEUE)
    public void handleOrder(OrderMessage msg) {
        Integer existing = jdbc.queryForObject(
                "SELECT COUNT(1) FROM order_info WHERE user_id = ? AND product_id = ?",
                Integer.class,
                msg.getUserId(),
                msg.getProductId()
        );
        if (existing != null && existing > 0) {
            return;
        }

        int updated = jdbc.update("UPDATE product SET stock = stock - 1 WHERE id = ? AND stock > 0", msg.getProductId());
        if (updated > 0) {
            jdbc.update("INSERT INTO order_info(user_id, product_id) VALUES(?, ?)", msg.getUserId(), msg.getProductId());
            redisTemplate.opsForValue().set(SeckillCacheKeys.userOrderKey(msg.getUserId(), msg.getProductId()), "1");
            return;
        }

        redisTemplate.delete(SeckillCacheKeys.userOrderKey(msg.getUserId(), msg.getProductId()));
        redisTemplate.opsForValue().increment(SeckillCacheKeys.stockKey(msg.getProductId()));
    }
}
