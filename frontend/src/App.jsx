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
