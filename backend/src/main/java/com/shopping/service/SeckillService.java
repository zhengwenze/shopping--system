package com.shopping.service;

import com.shopping.model.OrderMessage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class SeckillService {

    private static final String STOCK_KEY_PREFIX = "seckill:stock:";

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    private final DefaultRedisScript<Long> seckillScript = new DefaultRedisScript<>();

    public SeckillService() {
        seckillScript.setScriptText(
            "local stock = tonumber(redis.call('GET', KEYS[1])) " +
            "if stock <= 0 then return -1 end " +
            "redis.call('DECR', KEYS[1]) " +
            "return stock - 1"
        );
        seckillScript.setResultType(Long.class);
    }

    public boolean trySeckill(Long userId, Long productId) {
        Long stock = redisTemplate.execute(
            seckillScript,
            Collections.singletonList(STOCK_KEY_PREFIX + productId)
        );

        if (stock == null || stock < 0) {
            return false;
        }

        rabbitTemplate.convertAndSend("seckill_order", new OrderMessage(userId, productId));
        return true;
    }
}
