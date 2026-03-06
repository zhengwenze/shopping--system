package com.shopping.model;

public class SeckillSubmitResponse {

    private final Long userId;
    private final Long productId;
    private final String status;

    public SeckillSubmitResponse(Long userId, Long productId, String status) {
        this.userId = userId;
        this.productId = productId;
        this.status = status;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getProductId() {
        return productId;
    }

    public String getStatus() {
        return status;
    }
}
