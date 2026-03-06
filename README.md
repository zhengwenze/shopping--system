# Shopping System

一个面向练手和展示的秒杀系统示例项目，技术栈为 `Spring Boot + React + Redis + RabbitMQ + MySQL + Docker Compose`。

这个仓库现在支持两种工作方式：

1. 本地开发模式
2. Docker 一键部署模式

## 项目结构

```text
shopping--system/
├── backend/                 # Spring Boot 后端
├── frontend/                # React + Vite 前端
├── docker/
│   └── mysql/init/          # MySQL 初始化脚本
├── docker-compose.dev.yml   # 本地开发只启动中间件
├── docker-compose.yml       # 一键启动整套系统
└── README.md
```

## 你本机需要安装什么

推荐只安装这些：

- `Git`
- `Docker Desktop`
- `JDK 17`
- `Node.js 18+`
- `IDE`：IntelliJ IDEA / VS Code

不推荐本机裸装这些中间件：

- `MySQL`
- `Redis`
- `RabbitMQ`

它们都交给 Docker。

`Maven` 可以不单独安装。如果你用 IDEA 开发 Java，IDE 自带 Maven 支持；如果你只做 Docker 部署，后端镜像也会在容器里完成 Maven 构建。

## 本地开发模式

这个模式最适合日常开发和调试：

- Docker 只启动中间件
- 后端在本机启动
- 前端在本机启动

### 1. 启动中间件

```bash
docker compose -f docker-compose.dev.yml up -d
```

启动后会得到：

- MySQL: `localhost:3306`
- Redis: `localhost:6379`
- RabbitMQ: `localhost:5672`
- RabbitMQ 控制台: `http://localhost:15672`

数据库会自动执行初始化脚本：

- [docker/mysql/init/01-schema.sql](/Users/zhengwenze/Desktop/codex/shopping--system/docker/mysql/init/01-schema.sql)

### 2. 启动后端

后端开发配置文件：

- [application-dev.yml](/Users/zhengwenze/Desktop/codex/shopping--system/backend/src/main/resources/application-dev.yml)

建议方式：

- 用 IDEA 直接启动 [ShoppingSystemApplication.java](/Users/zhengwenze/Desktop/codex/shopping--system/backend/src/main/java/com/shopping/ShoppingSystemApplication.java)

如果你本机已经装了 Maven，也可以：

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问：

- 前端: `http://localhost:3000`
- 后端健康检查: `http://localhost:8080/actuator/health`

本地开发时，前端通过 Vite 代理把 `/api/*` 转发到后端。

## Docker 一键部署模式

这个模式适合演示、交付、部署：

```bash
docker compose up -d --build
```

访问：

- 前端: `http://localhost:3000`
- 后端: `http://localhost:8080`
- 健康检查: `http://localhost:8080/actuator/health`

部署模式下：

- `frontend` 容器通过 Nginx 代理 `/api/*`
- `backend` 容器使用 `docker` profile
- MySQL 在首次启动时自动建表和插入演示商品

## 当前实现的核心链路

1. 前端点击秒杀按钮
2. 请求到后端 `/seckill`
3. Redis Lua 脚本原子扣减缓存库存
4. RabbitMQ 异步投递订单消息
5. 消费者扣减数据库库存并写入订单表

关键文件：

- [SeckillController.java](/Users/zhengwenze/Desktop/codex/shopping--system/backend/src/main/java/com/shopping/controller/SeckillController.java)
- [SeckillService.java](/Users/zhengwenze/Desktop/codex/shopping--system/backend/src/main/java/com/shopping/service/SeckillService.java)
- [OrderConsumer.java](/Users/zhengwenze/Desktop/codex/shopping--system/backend/src/main/java/com/shopping/mq/OrderConsumer.java)
- [StockInitializer.java](/Users/zhengwenze/Desktop/codex/shopping--system/backend/src/main/java/com/shopping/config/StockInitializer.java)
- [SeckillButton.jsx](/Users/zhengwenze/Desktop/codex/shopping--system/frontend/src/SeckillButton.jsx)

## 目前已经补齐的工程化能力

- 开发态与部署态配置拆分
- MySQL 初始化脚本
- Docker Compose 健康检查
- 前端开发代理和部署代理
- 后端健康检查端点
- Redis 库存预热
- 更完整的忽略规则

## 下一步建议

如果继续往“更像企业项目”推进，下一批优先项是：

1. 增加接口返回统一结构
2. 增加全局异常处理
3. 增加用户维度限流和防重复下单
4. 增加单元测试和集成测试
5. 增加 CI/CD
6. 增加监控指标与日志追踪

你下一步如果愿意，我可以继续把这些能力往里加。 
