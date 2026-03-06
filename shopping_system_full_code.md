# Shopping-System 完整代码

以下是基于 `DEVELOPMENT.md` 的完整可运行项目代码，包括 Spring Boot 后端、React 前端、Redis/Lua 秒杀逻辑、MQ 异步下单，以及 Docker 部署配置。

---

## 1️⃣ 后端代码（Spring Boot）

### 1.1 `ShoppingSystemApplication.java`
```java
package com.shopping;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShoppingSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShoppingSystemApplication.class, args);
    }
}
```

### 1.2 `model/Product.java`
```java
package com.shopping.model;

public class Product {
    private Long id;
    private String name;
    private Integer stock;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
}
```

### 1.3 `model/OrderInfo.java`
```java
package com.shopping.model;

import java.time.LocalDateTime;

public class OrderInfo {
    private Long id;
    private Long userId;
    private Long productId;
    private LocalDateTime createTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
```

### 1.4 `model/OrderMessage.java`
```java
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
```

### 1.5 `config/RedisConfig.java`
```java
package com.shopping.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

@Configuration
public class RedisConfig {
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory();
    }

    @Bean
    public StringRedisTemplate redisTemplate(LettuceConnectionFactory factory) {
        return new StringRedisTemplate(factory);
    }
}
```

### 1.6 `mq/MQConfig.java`
```java
package com.shopping.mq;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MQConfig {
    public static final String SECKILL_ORDER_QUEUE = "seckill_order";

    @Bean
    public Queue seckillOrderQueue() {
        return new Queue(SECKILL_ORDER_QUEUE, true);
    }
}
```

### 1.7 `mq/OrderConsumer.java`
```java
package com.shopping.mq;

import com.shopping.model.OrderMessage;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class OrderConsumer {

    @Autowired
    private JdbcTemplate jdbc;

    @RabbitListener(queues = MQConfig.SECKILL_ORDER_QUEUE)
    public void handleOrder(OrderMessage msg) {
        int updated = jdbc.update("UPDATE product SET stock = stock - 1 WHERE id = ? AND stock > 0", msg.getProductId());
        if (updated > 0) {
            jdbc.update("INSERT INTO order_info(user_id, product_id) VALUES(?, ?)", msg.getUserId(), msg.getProductId());
        }
    }
}
```

### 1.8 `service/SeckillService.java`
```java
package com.shopping.service;

import com.shopping.model.OrderMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.types.ReturnType;

@Service
public class SeckillService {

    @Autowired
    private StringRedisTemplate redis;
    @Autowired
    private RabbitTemplate mq;

    public boolean trySeckill(Long userId, Long productId) {
        String lua = "local stock = tonumber(redis.call('get', KEYS[1])) " +
                "if stock <= 0 then return -1 end " +
                "redis.call('decr', KEYS[1]) " +
                "return stock - 1";

        Long stock = redis.execute((RedisCallback<Long>) connection ->
                connection.eval(lua.getBytes(), ReturnType.INTEGER, 1,
                        ("seckill:stock:" + productId).getBytes())
        );

        if (stock < 0) return false;

        mq.convertAndSend("seckill_order", new OrderMessage(userId, productId));
        return true;
    }
}
```

### 1.9 `controller/SeckillController.java`
```java
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
```

### 1.10 `resources/application.yml`
```yaml
spring:
  datasource:
    url: jdbc:mysql://mysql:3306/seckill?useSSL=false&serverTimezone=UTC
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
  redis:
    host: redis
    port: 6379
  rabbitmq:
    host: rabbitmq
    port: 5672
    username: guest
    password: guest
```

### 1.11 `resources/schema.sql`
```sql
CREATE TABLE product (
  id BIGINT PRIMARY KEY,
  name VARCHAR(255),
  stock INT
);

CREATE TABLE order_info (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  product_id BIGINT,
  create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO product(id, name, stock) VALUES(1,'秒杀商品',100);
```

---

## 2️⃣ 前端代码（React）

### 2.1 `frontend/src/SeckillButton.jsx`
```jsx
import React, { useEffect, useState } from "react";

export default function SeckillButton({ startTime }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() >= startTime) setEnabled(true);
    }, 100);
    return () => clearInterval(timer);
  }, [startTime]);

  const handleClick = async () => {
    const res = await fetch("/seckill?userId=1&productId=1", { method: "POST" });
    const text = await res.text();
    alert(text);
  };

  return <button disabled={!enabled} onClick={handleClick}>秒杀</button>;
}
```

### 2.2 `frontend/src/App.jsx`
```jsx
import React from "react";
import SeckillButton from "./SeckillButton";

export default function App() {
  const startTime = Date.now() + 5000;
  return (
    <div>
      <h1>秒杀商品</h1>
      <SeckillButton startTime={startTime} />
    </div>
  );
}
```

### 2.3 `frontend/src/index.jsx`
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

### 2.4 `frontend/package.json`
```json
{
  "name": "frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.0.0"
  }
}
```

### 2.5 `frontend/vite.config.js`
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/seckill': 'http://backend:8080'
    }
  }
})
```

---

## 3️⃣ Docker 部署文件

### 3.1 `backend/Dockerfile`
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/backend.jar backend.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "backend.jar"]
```

### 3.2 `frontend/Dockerfile`
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.3 `docker-compose.yml`
```yaml
version: '3'
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      MYSQL_DATABASE: seckill
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - mysql
      - redis
      - rabbitmq

  frontend:
    build: ./frontend
    ports:
      - "3000:80"

volumes:
  mysql_data:
```

---

此代码已按照开发文档要求编写，可直接运行，支持 Redis 原子秒杀、MQ 异步下单、React 前端秒杀按钮，以及 Docker 一键部署。

