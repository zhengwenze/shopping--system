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
