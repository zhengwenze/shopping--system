package com.shopping.controller;

import com.shopping.common.ApiResponse;
import com.shopping.common.ErrorCode;
import com.shopping.exception.BusinessException;
import com.shopping.model.SeckillSubmitResponse;
import com.shopping.service.SeckillService;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class SeckillController {

    @Autowired
    private SeckillService seckillService;

    @PostMapping("/seckill")
    public ApiResponse<SeckillSubmitResponse> seckill(@RequestParam Long userId, @RequestParam Long productId) {
        if (userId == null || userId <= 0 || productId == null || productId <= 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "用户或商品参数不合法", HttpStatus.BAD_REQUEST);
        }

        SeckillSubmitResponse response = seckillService.trySeckill(userId, productId);
        return ApiResponse.success("秒杀请求已受理，正在排队处理", response);
    }
}
