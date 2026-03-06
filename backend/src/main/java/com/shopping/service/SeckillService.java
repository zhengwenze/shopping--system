package com.shopping.service;

import com.shopping.common.ErrorCode;
import com.shopping.common.SeckillCacheKeys;
import com.shopping.exception.BusinessException;
import com.shopping.model.OrderMessage;
import com.shopping.model.SeckillSubmitResponse;
import com.shopping.mq.MQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Arrays;

@Service
public class SeckillService {

    private static final long RESULT_SOLD_OUT = -1L;
    private static final long RESULT_DUPLICATE = -2L;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    private final DefaultRedisScript<Long> seckillScript = new DefaultRedisScript<>();

    public SeckillService() {
        seckillScript.setScriptText(
            "if redis.call('EXISTS', KEYS[2]) == 1 then return -2 end " +
            "local stock = tonumber(redis.call('GET', KEYS[1])) " +
            "if not stock or stock <= 0 then return -1 end " +
            "redis.call('DECR', KEYS[1]) " +
            "redis.call('SET', KEYS[2], '1') " +
            "return stock - 1"
        );
        seckillScript.setResultType(Long.class);
    }

    public SeckillSubmitResponse trySeckill(Long userId, Long productId) {
        String stockKey = SeckillCacheKeys.stockKey(productId);
        String userOrderKey = SeckillCacheKeys.userOrderKey(userId, productId);
        Long stock = redisTemplate.execute(
            seckillScript,
            Arrays.asList(stockKey, userOrderKey)
        );

        if (stock == null) {
            throw new BusinessException(ErrorCode.SYSTEM_BUSY, "秒杀服务暂不可用，请稍后重试", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        if (stock == RESULT_SOLD_OUT) {
            throw new BusinessException(ErrorCode.SOLD_OUT, "商品已售罄", HttpStatus.CONFLICT);
        }

        if (stock == RESULT_DUPLICATE) {
            throw new BusinessException(ErrorCode.DUPLICATE_ORDER, "同一用户不能重复下单", HttpStatus.CONFLICT);
        }

        try {
            rabbitTemplate.convertAndSend(MQConfig.SECKILL_ORDER_QUEUE, new OrderMessage(userId, productId));
        } catch (RuntimeException ex) {
            redisTemplate.delete(userOrderKey);
            redisTemplate.opsForValue().increment(stockKey);
            throw new BusinessException(ErrorCode.SYSTEM_BUSY, "系统繁忙，请稍后重试", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new SeckillSubmitResponse(userId, productId, "QUEUED");
    }
}
