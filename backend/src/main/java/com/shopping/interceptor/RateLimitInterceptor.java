package com.shopping.interceptor;

import com.shopping.common.ErrorCode;
import com.shopping.common.SeckillCacheKeys;
import com.shopping.exception.BusinessException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private final StringRedisTemplate redisTemplate;
    private final int windowSeconds;
    private final int maxRequests;

    public RateLimitInterceptor(
            StringRedisTemplate redisTemplate,
            @Value("${app.seckill.rate-limit.window-seconds:5}") int windowSeconds,
            @Value("${app.seckill.rate-limit.max-requests:5}") int maxRequests
    ) {
        this.redisTemplate = redisTemplate;
        this.windowSeconds = windowSeconds;
        this.maxRequests = maxRequests;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String userId = request.getParameter("userId");
        String clientIp = resolveClientIp(request);
        String clientId = StringUtils.hasText(userId) ? userId + ":" + clientIp : clientIp;
        String key = SeckillCacheKeys.rateLimitKey(request.getRequestURI(), clientId);

        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, Duration.ofSeconds(windowSeconds));
        }

        if (count != null && count > maxRequests) {
            throw new BusinessException(
                    ErrorCode.RATE_LIMITED,
                    "请求过于频繁，请稍后再试",
                    HttpStatus.TOO_MANY_REQUESTS
            );
        }

        return true;
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwardedFor)) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
