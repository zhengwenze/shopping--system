import React from "react";
import SeckillButton from "./SeckillButton";

export default function App() {
    const startTime = Date.now() + 5000;
    return (
        <div style={{ fontFamily: "sans-serif", maxWidth: 640, margin: "48px auto", padding: "0 16px" }}>
            <h1>秒杀商品</h1>
            <p>{"演示链路：React -> Spring Boot -> Redis Lua -> RabbitMQ -> MySQL"}</p>
            <SeckillButton startTime={startTime} />
        </div>
    );
}
