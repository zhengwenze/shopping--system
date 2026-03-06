package com.shopping.service;

import com.shopping.model.OrderMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.types.ReturnType;

@Service
public class SeckillService {

    @Autowired
    private StringRedisTemplate redis;
    @Autowired
    private RabbitTemplate mq;

    public boolean trySeckill(Long userId, Long productId) {
        String lua = "local stock = tonumber(redis.call('get', KEYS[1])) " +
                "if stock <= 0 then return -1 end " +
                "redis.call('decr', KEYS[1]) " +
                "return stock - 1";

        Long stock = redis.execute((RedisCallback<Long>) connection ->
                connection.eval(lua.getBytes(), ReturnType.INTEGER, 1,
                        ("seckill:stock:" + productId).getBytes())
        );

        if (stock < 0) return false;

        mq.convertAndSend("seckill_order", new OrderMessage(userId, productId));
        return true;
    }
}
