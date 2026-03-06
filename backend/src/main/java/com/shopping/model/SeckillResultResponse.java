package com.shopping.model;

public class SeckillResultResponse {

    private final Long userId;
    private final Long productId;
    private final String status;
    private final boolean finished;
    private final String message;

    public SeckillResultResponse(Long userId, Long productId, String status, boolean finished, String message) {
        this.userId = userId;
        this.productId = productId;
        this.status = status;
        this.finished = finished;
        this.message = message;
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

    public boolean isFinished() {
        return finished;
    }

    public String getMessage() {
        return message;
    }
}
