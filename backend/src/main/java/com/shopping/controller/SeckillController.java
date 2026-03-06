package com.shopping.controller;

import com.shopping.common.ApiResponse;
import com.shopping.common.ErrorCode;
import com.shopping.exception.BusinessException;
import com.shopping.model.SeckillResultResponse;
import com.shopping.model.SeckillSubmitResponse;
import com.shopping.security.AuthenticatedUser;
import com.shopping.service.SeckillService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SeckillController {

    private final SeckillService seckillService;

    public SeckillController(SeckillService seckillService) {
        this.seckillService = seckillService;
    }

    @PostMapping("/seckill")
    public ApiResponse<SeckillSubmitResponse> seckill(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @RequestParam Long productId
    ) {
        if (currentUser == null || currentUser.getId() == null || currentUser.getId() <= 0 || productId == null || productId <= 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "用户或商品参数不合法", HttpStatus.BAD_REQUEST);
        }

        SeckillSubmitResponse response = seckillService.trySeckill(currentUser.getId(), productId);
        return ApiResponse.success("秒杀请求已受理，正在排队处理", response);
    }

    @GetMapping("/seckill/result")
    public ApiResponse<SeckillResultResponse> getSeckillResult(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @RequestParam Long productId
    ) {
        if (currentUser == null || currentUser.getId() == null || currentUser.getId() <= 0 || productId == null || productId <= 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "用户或商品参数不合法", HttpStatus.BAD_REQUEST);
        }

        SeckillResultResponse response = seckillService.getSeckillResult(currentUser.getId(), productId);
        return ApiResponse.success(response.getMessage(), response);
    }
}
