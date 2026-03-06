import React, { useEffect, useState } from "react";

export default function SeckillButton({ startTime }) {
    const userId = 1;
    const productId = 1;
    const [enabled, setEnabled] = useState(false);
    const [countdown, setCountdown] = useState(Math.max(0, startTime - Date.now()));
    const [submitting, setSubmitting] = useState(false);
    const [resultMessage, setResultMessage] = useState("等待秒杀开始");
    const [resultStatus, setResultStatus] = useState("IDLE");

    useEffect(() => {
        if (resultStatus !== "QUEUED") {
            return undefined;
        }

        let active = true;
        const pollTimer = setInterval(async () => {
            try {
                const res = await fetch(`/api/seckill/result?userId=${userId}&productId=${productId}`);
                const body = await res.json();
                const result = body.data;

                if (!active || !result) {
                    return;
                }

                setResultStatus(result.status);
                setResultMessage(result.message);

                if (result.finished) {
                    clearInterval(pollTimer);
                }
            } catch (error) {
                if (active) {
                    setResultMessage("结果查询失败，请稍后刷新重试");
                }
            }
        }, 1000);

        return () => {
            active = false;
            clearInterval(pollTimer);
        };
    }, [resultStatus, productId, userId]);

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
            const res = await fetch(`/api/seckill?userId=${userId}&productId=${productId}`, { method: "POST" });
            const body = await res.json();
            const result = body.data;
            setResultMessage(body.message);
            if (result?.status) {
                setResultStatus(result.status);
            }
        } catch (error) {
            setResultStatus("ERROR");
            setResultMessage("请求失败，请稍后重试");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <p>{enabled ? "活动已开始" : `倒计时 ${Math.ceil(countdown / 1000)} 秒`}</p>
            <p>当前状态：{resultMessage}</p>
            <button disabled={!enabled || submitting} onClick={handleClick}>
                {submitting ? "提交中..." : "秒杀"}
            </button>
        </div>
    );
}
