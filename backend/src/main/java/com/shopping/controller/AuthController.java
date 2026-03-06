package com.shopping.controller;

import com.shopping.common.ApiResponse;
import com.shopping.model.AuthRequest;
import com.shopping.model.AuthResponse;
import com.shopping.model.UserProfileResponse;
import com.shopping.security.AuthenticatedUser;
import com.shopping.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.register(request);
        return ApiResponse.success("注册成功", response);
    }

    @PostMapping("/auth/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.login(request);
        return ApiResponse.success("登录成功", response);
    }

    @GetMapping("/auth/me")
    public ApiResponse<UserProfileResponse> me(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        UserProfileResponse response = authService.getCurrentUser(currentUser.getId());
        return ApiResponse.success("获取当前用户成功", response);
    }
}
