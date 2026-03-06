package com.shopping.controller;

import com.shopping.service.SeckillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
public class SeckillController {

    @Autowired
    private SeckillService seckillService;

    @PostMapping("/seckill")
    public String seckill(@RequestParam Long userId, @RequestParam Long productId) {
        boolean ok = seckillService.trySeckill(userId, productId);
        return ok ? "排队成功" : "秒杀结束";
    }
}
