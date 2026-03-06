package com.shopping;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class ShoppingSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShoppingSystemApplication.class, args);
    }
}
