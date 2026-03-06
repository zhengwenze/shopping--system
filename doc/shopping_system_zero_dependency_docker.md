# Shopping-System 零依赖 Docker 部署指南

本指南提供一个 **完全零本地依赖环境** 的全栈秒杀系统部署方案。无需本地安装 Maven、Node.js、MySQL、Redis 或 RabbitMQ，只需要 Docker 和 Docker Compose 即可完成全栈系统启动。

---

## 1️⃣ 准备环境
- 安装 Docker: [Docker 安装指南](https://docs.docker.com/get-docker/)
- 安装 Docker Compose（Docker Desktop 已自带）

检查安装：
```bash
docker -v
docker compose version
```

确保端口 3306、6379、5672、8080、3000 可用。

---

## 2️⃣ Dockerfile 配置（零本地依赖）

### 2.1 后端 Dockerfile (`backend/Dockerfile`)
```dockerfile
# 构建阶段
FROM maven:3.9.0-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# 运行阶段
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/backend.jar backend.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","backend.jar"]
```

### 2.2 前端 Dockerfile (`frontend/Dockerfile`)
```dockerfile
# 构建阶段
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 3️⃣ Docker Compose 配置 (`docker-compose.yml`)
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

> 注：服务依赖关系已配置，Docker Compose 会自动按顺序启动。

---

## 4️⃣ 一步式启动命令（零依赖）
```bash
# 1. 克隆项目
mkdir -p ~/shopping-system && cd ~/shopping-system

git clone https://github.com/your-username/shopping-system.git .

# 2. 一键构建并启动服务
docker compose up -d --build

# 3. 等待 MySQL 启动
echo "等待 20 秒让 MySQL 启动..."
sleep 20

# 4. 初始化数据库
docker exec -i shopping-system_mysql_1 mysql -uroot -p123456 seckill < backend/src/main/resources/schema.sql

# 5. 完成提示
echo "系统启动完成！"
echo "前端访问: http://localhost:3000"
echo "后端接口: http://localhost:8080/seckill"
```

> 如果 MySQL 容器名称不同，可用 `docker ps` 查看并替换命令。

---

## 5️⃣ 服务管理命令
| 操作 | 命令 |
|------|------|
| 查看服务状态 | `docker compose ps` |
| 查看日志 | `docker compose logs -f` |
| 停止服务 | `docker compose down` |
| 删除镜像和卷 | `docker compose down --rmi all -v` |

---

## 6️⃣ 系统访问
- **前端页面**: [http://localhost:3000](http://localhost:3000)
- **后端接口**: [http://localhost:8080/seckill](http://localhost:8080/seckill)

秒杀按钮会在倒计时结束后点亮，点击即可触发秒杀逻辑。

---

## 7️⃣ 高并发注意事项
1. Redis Lua 脚本保证库存原子扣减
2. MQ 异步下单，处理高峰流量
3. 页面静态化 + CDN 可进一步减轻服务端压力
4. 用户/IP/接口限流 + 验证码 + 业务门槛
5. 日志监控与异常处理，防止数据丢失或重复消费

---

## 8️⃣ 总结
通过本指南，你可以在 **完全零本地依赖环境** 下，一条命令启动完整全栈秒杀系统，包括 MySQL、Redis、RabbitMQ、Spring Boot 后端和 React 前端，实现真正的交付即运行。