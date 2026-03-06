package com.shopping.common;

public final class SeckillCacheKeys {

    private static final String STOCK_KEY_PREFIX = "seckill:stock:";
    private static final String USER_ORDER_KEY_PREFIX = "seckill:order:";
    private static final String RESULT_KEY_PREFIX = "seckill:result:";
    private static final String RATE_LIMIT_KEY_PREFIX = "seckill:rate-limit:";

    private SeckillCacheKeys() {
    }

    public static String stockKey(Long productId) {
        return STOCK_KEY_PREFIX + productId;
    }

    public static String userOrderKey(Long userId, Long productId) {
        return USER_ORDER_KEY_PREFIX + userId + ":" + productId;
    }

    public static String resultKey(Long userId, Long productId) {
        return RESULT_KEY_PREFIX + userId + ":" + productId;
    }

    public static String rateLimitKey(String requestUri, String clientId) {
        return RATE_LIMIT_KEY_PREFIX + requestUri + ":" + clientId;
    }
}
