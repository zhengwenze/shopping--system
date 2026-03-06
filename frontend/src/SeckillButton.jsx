import React, { useEffect, useState } from "react";

const productId = 1;

const actionButtonStyle = {
    width: "100%",
    border: "none",
    borderRadius: 16,
    padding: "16px 18px",
    fontSize: 17,
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #ff7b1c 0%, #ff4f2b 100%)",
    boxShadow: "0 16px 30px rgba(255, 91, 43, 0.28)",
};

async function parseJsonResponse(response) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export default function SeckillButton({ startTime, token, user, onAuthExpired }) {
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
                const response = await fetch(`/api/seckill/result?productId=${productId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const body = await parseJsonResponse(response);

                if (!active) {
                    return;
                }

                if (response.status === 401 || body?.code === 40100) {
                    setResultStatus("AUTH_EXPIRED");
                    setResultMessage(body?.message || "登录状态已失效，请重新登录");
                    onAuthExpired();
                    clearInterval(pollTimer);
                    return;
                }

                if (!response.ok || !body || body.code !== 0 || !body.data) {
                    setResultStatus("ERROR");
                    setResultMessage(body?.message || "结果查询失败，请稍后刷新重试");
                    return;
                }

                setResultStatus(body.data.status);
                setResultMessage(body.data.message);

                if (body.data.finished) {
                    clearInterval(pollTimer);
                }
            } catch (error) {
                if (active) {
                    setResultStatus("ERROR");
                    setResultMessage("结果查询失败，请稍后刷新重试");
                }
            }
        }, 1000);

        return () => {
            active = false;
            clearInterval(pollTimer);
        };
    }, [onAuthExpired, resultStatus, token]);

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
            const response = await fetch(`/api/seckill?productId=${productId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const body = await parseJsonResponse(response);

            if (response.status === 401 || body?.code === 40100) {
                setResultStatus("AUTH_EXPIRED");
                setResultMessage(body?.message || "登录状态已失效，请重新登录");
                onAuthExpired();
                return;
            }

            if (!response.ok || !body) {
                setResultStatus("ERROR");
                setResultMessage(body?.message || "请求失败，请稍后重试");
                return;
            }

            setResultMessage(body.message || "请求已提交");
            if (body.data?.status) {
                setResultStatus(body.data.status);
            } else {
                setResultStatus("ERROR");
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
            <div style={{ marginBottom: 20 }}>
                <p style={{ margin: "0 0 6px", fontSize: 14, color: "#6b7686" }}>当前登录账号</p>
                <h3 style={{ margin: 0, fontSize: 24 }}>{user.username}</h3>
                <p style={{ margin: "8px 0 0", color: "#6b7686", lineHeight: 1.7 }}>
                    商品 ID：{productId}，请求身份将由 JWT 自动传递给后端。
                </p>
            </div>

            <div
                style={{
                    marginBottom: 20,
                    padding: 16,
                    borderRadius: 18,
                    background: "#f7f9fc",
                    border: "1px solid rgba(28, 36, 49, 0.08)",
                }}
            >
                <p style={{ margin: "0 0 10px", color: "#6b7686" }}>
                    {enabled ? "活动已开始，可以发起秒杀" : `倒计时 ${Math.ceil(countdown / 1000)} 秒`}
                </p>
                <p style={{ margin: 0, fontWeight: 600, lineHeight: 1.8 }}>当前状态：{resultMessage}</p>
            </div>

            <button disabled={!enabled || submitting} onClick={handleClick} style={actionButtonStyle}>
                {submitting ? "提交中..." : "立即秒杀"}
            </button>
        </div>
    );
}
