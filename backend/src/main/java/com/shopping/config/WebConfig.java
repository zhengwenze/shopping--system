package com.shopping.config;

import com.shopping.interceptor.RateLimitInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;
    private final RateLimitInterceptor rateLimitInterceptor;

    public WebConfig(
            @Value("${app.cors.allowed-origins:http://localhost:3000}") String allowedOrigins,
            RateLimitInterceptor rateLimitInterceptor
    ) {
        this.allowedOrigins = StringUtils.commaDelimitedListToStringArray(allowedOrigins);
        this.rateLimitInterceptor = rateLimitInterceptor;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/seckill")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("POST", "OPTIONS");
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/seckill");
    }
}
