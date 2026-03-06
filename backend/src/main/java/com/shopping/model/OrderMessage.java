package com.shopping.model;

public class OrderMessage {
    private Long userId;
    private Long productId;

    public OrderMessage() {}
    public OrderMessage(Long userId, Long productId) {
        this.userId = userId;
        this.productId = productId;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
}
