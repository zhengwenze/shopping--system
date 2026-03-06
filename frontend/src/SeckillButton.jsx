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

const stockBadgeStyle = {
    padding: "16px 18px",
    borderRadius: 18,
    background: "linear-gradient(145deg, rgba(255, 242, 219, 0.9), rgba(255, 249, 238, 0.96))",
    border: "1px solid rgba(226, 164, 82, 0.22)",
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
    const [remainingStock, setRemainingStock] = useState(null);
    const [stockError, setStockError] = useState("");

    useEffect(() => {
        let active = true;

        async function loadStock() {
            try {
                const response = await fetch(`/api/seckill/stock?productId=${productId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const body = await parseJsonResponse(response);

                if (!active) {
                    return;
                }

                if (response.status === 401 || body?.code === 40100) {
                    setStockError(body?.message || "登录状态已失效，请重新登录");
                    onAuthExpired();
                    return;
                }

                if (!response.ok || !body || body.code !== 0 || !body.data) {
                    setStockError(body?.message || "库存获取失败");
                    return;
                }

                setRemainingStock(body.data.remainingStock);
                setStockError("");
            } catch (error) {
                if (active) {
                    setStockError("库存获取失败");
                }
            }
        }

        loadStock();
        const stockTimer = setInterval(loadStock, 1000);

        return () => {
            active = false;
            clearInterval(stockTimer);
        };
    }, [onAuthExpired, token]);

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

    const isSoldOut = remainingStock !== null && remainingStock <= 0;

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

            if (typeof remainingStock === "number" && remainingStock > 0) {
                setRemainingStock(Math.max(remainingStock - 1, 0));
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
                    display: "grid",
                    gap: 14,
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    marginBottom: 18,
                }}
            >
                <div style={stockBadgeStyle}>
                    <p style={{ margin: "0 0 8px", fontSize: 13, color: "#9b763f", letterSpacing: 1 }}>实时库存</p>
                    <div style={{ fontSize: 30, fontWeight: 800, color: isSoldOut ? "#c65134" : "#b86a13" }}>
                        {remainingStock === null ? "--" : remainingStock}
                    </div>
                    <p style={{ margin: "8px 0 0", color: "#8c6e45", fontSize: 14 }}>
                        {stockError || (isSoldOut ? "当前商品已售罄" : "每秒自动同步一次")}
                    </p>
                </div>

                <div style={stockBadgeStyle}>
                    <p style={{ margin: "0 0 8px", fontSize: 13, color: "#9b763f", letterSpacing: 1 }}>商品状态</p>
                    <div style={{ fontSize: 24, fontWeight: 800, color: enabled ? "#c56f14" : "#86643c" }}>
                        {enabled ? "活动进行中" : "等待开场"}
                    </div>
                    <p style={{ margin: "8px 0 0", color: "#8c6e45", fontSize: 14 }}>
                        {enabled ? "库存会随秒杀请求实时变化" : `倒计时 ${Math.ceil(countdown / 1000)} 秒`}
                    </p>
                </div>
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

            <button
                disabled={!enabled || submitting || isSoldOut}
                onClick={handleClick}
                style={{
                    ...actionButtonStyle,
                    opacity: !enabled || submitting || isSoldOut ? 0.6 : 1,
                    cursor: !enabled || submitting || isSoldOut ? "not-allowed" : "pointer",
                }}
            >
                {isSoldOut ? "已售罄" : submitting ? "提交中..." : "立即秒杀"}
            </button>
        </div>
    );
}
