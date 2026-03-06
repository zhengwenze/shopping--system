import React, { useEffect, useState } from "react";

export default function SeckillButton({ startTime }) {
    const [enabled, setEnabled] = useState(false);
    const [countdown, setCountdown] = useState(Math.max(0, startTime - Date.now()));

    useEffect(() => {
        const timer = setInterval(() => {
            const remaining = Math.max(0, startTime - Date.now());
            setCountdown(remaining);
            if (remaining === 0) {
                setEnabled(true);
            }
        }, 100);
        return () => clearInterval(timer);
    }, [startTime]);

    const handleClick = async () => {
        const res = await fetch("/api/seckill?userId=1&productId=1", { method: "POST" });
        const text = await res.text();
        alert(text);
    };

    return (
        <div>
            <p>{enabled ? "活动已开始" : `倒计时 ${Math.ceil(countdown / 1000)} 秒`}</p>
            <button disabled={!enabled} onClick={handleClick}>秒杀</button>
        </div>
    );
}
