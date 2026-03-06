import React, { useEffect, useState } from "react";

export default function SeckillButton({ startTime }) {
    const [enabled, setEnabled] = useState(false);
    const [countdown, setCountdown] = useState(Math.max(0, startTime - Date.now()));
    const [submitting, setSubmitting] = useState(false);

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
        setSubmitting(true);
        try {
            const res = await fetch("/api/seckill?userId=1&productId=1", { method: "POST" });
            const body = await res.json();
            alert(body.message);
        } catch (error) {
            alert("请求失败，请稍后重试");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <p>{enabled ? "活动已开始" : `倒计时 ${Math.ceil(countdown / 1000)} 秒`}</p>
            <button disabled={!enabled || submitting} onClick={handleClick}>
                {submitting ? "提交中..." : "秒杀"}
            </button>
        </div>
    );
}
