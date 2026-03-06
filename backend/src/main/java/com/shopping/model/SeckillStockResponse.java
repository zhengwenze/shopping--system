package com.shopping.model;

public class SeckillStockResponse {

    private final Long productId;
    private final int remainingStock;
    private final boolean soldOut;

    public SeckillStockResponse(Long productId, int remainingStock, boolean soldOut) {
        this.productId = productId;
        this.remainingStock = remainingStock;
        this.soldOut = soldOut;
    }

    public Long getProductId() {
        return productId;
    }

    public int getRemainingStock() {
        return remainingStock;
    }

    public boolean isSoldOut() {
        return soldOut;
    }
}
