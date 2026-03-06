import React, { useEffect, useState } from "react";
import SeckillButton from "./SeckillButton";

const TOKEN_STORAGE_KEY = "shopping-system-token";
const USER_STORAGE_KEY = "shopping-system-user";

const shellStyle = {
    minHeight: "100vh",
    padding: "32px 16px",
    background:
        "radial-gradient(circle at top left, rgba(255, 208, 111, 0.45), transparent 32%), linear-gradient(135deg, #fff7eb 0%, #fff 45%, #eef6ff 100%)",
    color: "#1c2431",
    fontFamily: '"Segoe UI", "PingFang SC", "Hiragino Sans GB", sans-serif',
};

const panelStyle = {
    width: "100%",
    maxWidth: 1080,
    margin: "0 auto",
    background: "rgba(255, 255, 255, 0.92)",
    border: "1px solid rgba(28, 36, 49, 0.08)",
    borderRadius: 28,
    boxShadow: "0 24px 80px rgba(30, 51, 84, 0.14)",
    overflow: "hidden",
};

const authGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
};

const heroStyle = {
    padding: "56px 48px",
    background:
        "linear-gradient(160deg, rgba(255, 237, 196, 0.96) 0%, rgba(255, 248, 232, 0.9) 50%, rgba(255, 255, 255, 0.95) 100%)",
};

const formPanelStyle = {
    padding: "40px 32px",
    background: "rgba(255, 255, 255, 0.98)",
};

const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(28, 36, 49, 0.12)",
    outline: "none",
    fontSize: 15,
    boxSizing: "border-box",
    background: "#fff",
};

const primaryButtonStyle = {
    width: "100%",
    border: "none",
    borderRadius: 14,
    padding: "14px 18px",
    fontSize: 16,
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #ff7b1c 0%, #ff4f2b 100%)",
    boxShadow: "0 14px 28px rgba(255, 91, 43, 0.28)",
};

const secondaryButtonStyle = {
    border: "1px solid rgba(28, 36, 49, 0.12)",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 14,
    fontWeight: 600,
    background: "#fff",
    cursor: "pointer",
};

function parseStoredUser() {
    const rawUser = localStorage.getItem(USER_STORAGE_KEY);
    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser);
    } catch (error) {
        return null;
    }
}

async function parseJsonResponse(response) {
    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

export default function App() {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ username: "", password: "" });
    const [session, setSession] = useState({ token: null, user: null });
    const [checkingSession, setCheckingSession] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [authMessage, setAuthMessage] = useState("");
    const [authError, setAuthError] = useState(false);
    const [startTime] = useState(() => Date.now() + 5000);

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (!token) {
            setCheckingSession(false);
            return;
        }

        const storedUser = parseStoredUser();
        verifySession(token, storedUser);
    }, []);

    async function verifySession(token, fallbackUser) {
        setCheckingSession(true);

        try {
            const response = await fetch("/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const body = await parseJsonResponse(response);

            if (!response.ok || !body || body.code !== 0 || !body.data) {
                clearSession("登录状态已失效，请重新登录", true);
                return;
            }

            persistSession(token, body.data);
            setAuthMessage(fallbackUser ? `欢迎回来，${body.data.username}` : "");
            setAuthError(false);
        } catch (error) {
            clearSession("无法校验登录状态，请重新登录", true);
        } finally {
            setCheckingSession(false);
        }
    }

    function persistSession(token, user) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        setSession({ token, user });
    }

    function clearSession(message = "", keepMode = false) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setSession({ token: null, user: null });
        setAuthMessage(message);
        setAuthError(Boolean(message));
        if (!keepMode) {
            setMode("login");
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitting(true);
        setAuthMessage("");
        setAuthError(false);

        try {
            const response = await fetch(`/api/auth/${mode}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: form.username.trim(),
                    password: form.password,
                }),
            });
            const body = await parseJsonResponse(response);

            if (!response.ok || !body || body.code !== 0 || !body.data?.token || !body.data?.user) {
                setAuthMessage(body?.message || "操作失败，请稍后重试");
                setAuthError(true);
                return;
            }

            persistSession(body.data.token, body.data.user);
            setForm({ username: "", password: "" });
            setAuthMessage(mode === "register" ? "注册并登录成功" : "登录成功");
            setAuthError(false);
        } catch (error) {
            setAuthMessage("网络异常，请稍后重试");
            setAuthError(true);
        } finally {
            setSubmitting(false);
        }
    }

    function switchMode(nextMode) {
        setMode(nextMode);
        setAuthMessage("");
        setAuthError(false);
    }

    if (checkingSession) {
        return (
            <div style={shellStyle}>
                <div style={{ ...panelStyle, maxWidth: 720, padding: 48, textAlign: "center" }}>
                    <h1 style={{ marginTop: 0, marginBottom: 12 }}>秒杀系统</h1>
                    <p style={{ margin: 0, color: "#566273" }}>正在校验登录状态...</p>
                </div>
            </div>
        );
    }

    if (!session.token || !session.user) {
        return (
            <div style={shellStyle}>
                <div style={panelStyle}>
                    <div style={authGridStyle}>
                        <section style={heroStyle}>
                            <div
                                style={{
                                    display: "inline-flex",
                                    padding: "8px 14px",
                                    borderRadius: 999,
                                    background: "rgba(255, 122, 30, 0.12)",
                                    color: "#d86108",
                                    fontWeight: 700,
                                    fontSize: 13,
                                }}
                            >
                                企业级秒杀演示
                            </div>
                            <h1 style={{ margin: "24px 0 16px", fontSize: "clamp(36px, 6vw, 48px)", lineHeight: 1.08 }}>
                                先登录，再进入
                                <br />
                                秒杀控制台
                            </h1>
                            <p style={{ margin: 0, maxWidth: 420, color: "#4c596a", fontSize: 16, lineHeight: 1.8 }}>
                                当前链路已经接入 JWT 鉴权、Redis 预扣库存、RabbitMQ 异步下单和最终结果反馈。未登录用户无法直接发起秒杀请求。
                            </p>
                            <div
                                style={{
                                    marginTop: 32,
                                    display: "grid",
                                    gap: 16,
                                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                                }}
                            >
                                {[
                                    { title: "JWT 鉴权", text: "登录成功后统一下发 token，接口按用户身份鉴权。" },
                                    { title: "重复下单保护", text: "Redis 原子扣减和数据库唯一索引双保险。" },
                                    { title: "最终状态可见", text: "前端轮询结果，用户能看到最终是否秒杀成功。" },
                                ].map((item) => (
                                    <div
                                        key={item.title}
                                        style={{
                                            padding: 18,
                                            borderRadius: 20,
                                            background: "rgba(255, 255, 255, 0.64)",
                                            border: "1px solid rgba(28, 36, 49, 0.08)",
                                        }}
                                    >
                                        <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{item.title}</h3>
                                        <p style={{ margin: 0, color: "#5b6778", lineHeight: 1.7 }}>{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section style={formPanelStyle}>
                            <div
                                style={{
                                    display: "inline-flex",
                                    gap: 8,
                                    padding: 6,
                                    marginBottom: 24,
                                    background: "#f6f8fb",
                                    borderRadius: 16,
                                }}
                            >
                                {[
                                    { key: "login", label: "登录" },
                                    { key: "register", label: "注册" },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => switchMode(item.key)}
                                        style={{
                                            ...secondaryButtonStyle,
                                            border: "none",
                                            background: mode === item.key ? "#1c2431" : "transparent",
                                            color: mode === item.key ? "#fff" : "#4a5666",
                                        }}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            <h2 style={{ margin: "0 0 8px", fontSize: 28 }}>{mode === "login" ? "账号登录" : "创建账号"}</h2>
                            <p style={{ margin: "0 0 24px", color: "#5b6778", lineHeight: 1.7 }}>
                                {mode === "login"
                                    ? "登录成功后才会进入秒杀页面。"
                                    : "注册完成后会自动登录并进入秒杀页面。"}
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: "grid", gap: 16 }}>
                                    <label>
                                        <div style={{ marginBottom: 8, fontWeight: 600 }}>用户名</div>
                                        <input
                                            style={inputStyle}
                                            type="text"
                                            placeholder="请输入 3-32 位用户名"
                                            value={form.username}
                                            onChange={(event) =>
                                                setForm((current) => ({ ...current, username: event.target.value }))
                                            }
                                            autoComplete="username"
                                        />
                                    </label>

                                    <label>
                                        <div style={{ marginBottom: 8, fontWeight: 600 }}>密码</div>
                                        <input
                                            style={inputStyle}
                                            type="password"
                                            placeholder="请输入 6-64 位密码"
                                            value={form.password}
                                            onChange={(event) =>
                                                setForm((current) => ({ ...current, password: event.target.value }))
                                            }
                                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                                        />
                                    </label>

                                    <button type="submit" disabled={submitting} style={primaryButtonStyle}>
                                        {submitting ? "提交中..." : mode === "login" ? "登录并进入秒杀页" : "注册并进入秒杀页"}
                                    </button>
                                </div>
                            </form>

                            <p
                                style={{
                                    marginTop: 18,
                                    minHeight: 24,
                                    color: authError ? "#d53a2f" : "#2c7a43",
                                    fontWeight: 600,
                                }}
                            >
                                {authMessage}
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={shellStyle}>
            <div style={{ ...panelStyle, padding: 32 }}>
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        gap: 16,
                        marginBottom: 28,
                        alignItems: "center",
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: "inline-flex",
                                padding: "7px 12px",
                                borderRadius: 999,
                                background: "rgba(35, 148, 88, 0.12)",
                                color: "#18804a",
                                fontSize: 13,
                                fontWeight: 700,
                            }}
                        >
                            已登录
                        </div>
                        <h1 style={{ margin: "16px 0 8px", fontSize: "clamp(30px, 5vw, 40px)" }}>秒杀控制台</h1>
                        <p style={{ margin: 0, color: "#5b6778", fontSize: 16 }}>
                            当前用户：<strong>{session.user.username}</strong>（ID {session.user.id}）
                        </p>
                    </div>

                    <button
                        type="button"
                        style={secondaryButtonStyle}
                        onClick={() => clearSession("你已退出登录")}
                    >
                        退出登录
                    </button>
                </div>

                <div
                    style={{
                        display: "grid",
                        gap: 24,
                        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    }}
                >
                    <section
                        style={{
                            padding: 28,
                            borderRadius: 24,
                            background: "linear-gradient(135deg, #1f2937 0%, #263850 60%, #314d6b 100%)",
                            color: "#fff",
                        }}
                    >
                        <p style={{ margin: 0, opacity: 0.7, letterSpacing: 1.2 }}>FLASH SALE PRODUCT</p>
                        <h2 style={{ margin: "18px 0 10px", fontSize: 32 }}>秒杀商品</h2>
                        <p style={{ margin: 0, maxWidth: 420, color: "rgba(255,255,255,0.78)", lineHeight: 1.8 }}>
                            登录成功后，秒杀请求会携带 JWT 身份信息进入后端。库存扣减、排队下单和最终结果反馈都基于当前登录用户执行。
                        </p>
                        <div
                            style={{
                                marginTop: 28,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 12,
                                padding: "12px 16px",
                                borderRadius: 16,
                                background: "rgba(255,255,255,0.1)",
                            }}
                        >
                            <div
                                style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    background: "#54d38a",
                                    boxShadow: "0 0 18px rgba(84, 211, 138, 0.8)",
                                }}
                            />
                            <span>链路已启用身份鉴权与结果回传</span>
                        </div>
                    </section>

                    <section
                        style={{
                            padding: 28,
                            borderRadius: 24,
                            background: "#fff",
                            border: "1px solid rgba(28, 36, 49, 0.08)",
                        }}
                    >
                        <SeckillButton
                            startTime={startTime}
                            token={session.token}
                            user={session.user}
                            onAuthExpired={() => clearSession("登录状态已失效，请重新登录")}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
