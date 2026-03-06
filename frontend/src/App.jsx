import React, { useEffect, useState } from "react";
import SeckillButton from "./SeckillButton";

const TOKEN_STORAGE_KEY = "shopping-system-token";
const USER_STORAGE_KEY = "shopping-system-user";

const shellStyle = {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    padding: "24px",
    background:
        "linear-gradient(135deg, #fff7dd 0%, #ffe7bf 35%, #ffd9a6 65%, #ffc98c 100%)",
    color: "#2d2317",
    fontFamily: '"Segoe UI", "PingFang SC", "Hiragino Sans GB", sans-serif',
};

const decorationStyle = [
    {
        width: 420,
        height: 420,
        top: -140,
        left: -90,
        background: "rgba(255, 244, 221, 0.28)",
    },
    {
        width: 280,
        height: 280,
        top: 160,
        left: "23%",
        background: "rgba(255, 233, 190, 0.18)",
    },
    {
        width: 360,
        height: 360,
        bottom: -140,
        left: "30%",
        background: "rgba(255, 247, 227, 0.22)",
    },
];

const layoutStyle = {
    width: "100%",
    maxWidth: 1520,
    minHeight: "calc(100vh - 48px)",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.45fr) minmax(360px, 560px)",
    gap: 48,
    alignItems: "center",
    position: "relative",
    zIndex: 1,
};

const heroWrapStyle = {
    minHeight: 720,
    display: "flex",
    alignItems: "center",
    paddingLeft: "clamp(16px, 4vw, 64px)",
};

const heroContentStyle = {
    maxWidth: 760,
};

const heroBadgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 18,
    marginBottom: 28,
};

const logoBoxStyle = {
    width: 72,
    height: 72,
    borderRadius: 22,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(145deg, rgba(255,255,255,0.34), rgba(255,255,255,0.14))",
    boxShadow: "0 18px 38px rgba(190, 120, 40, 0.18)",
    backdropFilter: "blur(10px)",
    color: "#fff9ef",
};

const glassCardStyle = {
    marginTop: 34,
    padding: "24px 26px",
    borderRadius: 26,
    background: "linear-gradient(145deg, rgba(255,255,255,0.22), rgba(255,255,255,0.1))",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 24px 60px rgba(163, 100, 18, 0.12)",
};

const authCardStyle = {
    width: "100%",
    maxWidth: 560,
    justifySelf: "end",
    padding: "44px 40px 34px",
    borderRadius: 34,
    background: "rgba(255, 251, 243, 0.9)",
    border: "1px solid rgba(255, 255, 255, 0.58)",
    boxShadow: "0 38px 80px rgba(146, 88, 15, 0.25)",
    backdropFilter: "blur(12px)",
};

const segmentStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    padding: 6,
    marginBottom: 30,
    background: "#f6ead5",
    borderRadius: 18,
};

const segmentButtonStyle = {
    height: 58,
    border: "none",
    borderRadius: 15,
    fontSize: 20,
    fontWeight: 700,
    background: "transparent",
    color: "#866335",
    cursor: "pointer",
};

const fieldStyle = {
    display: "grid",
    gridTemplateColumns: "28px 1fr",
    alignItems: "center",
    gap: 12,
    height: 60,
    padding: "0 18px",
    borderRadius: 16,
    border: "1px solid rgba(147, 116, 68, 0.18)",
    background: "rgba(255,255,255,0.72)",
    boxSizing: "border-box",
};

const inputStyle = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#42321f",
    fontSize: 17,
};

const submitButtonStyle = {
    width: "100%",
    height: 60,
    border: "none",
    borderRadius: 16,
    color: "#fffef8",
    fontSize: 20,
    fontWeight: 700,
    cursor: "pointer",
    background: "linear-gradient(135deg, #ffb14c 0%, #f58a1f 56%, #e56b1e 100%)",
    boxShadow: "0 18px 36px rgba(228, 116, 24, 0.3)",
};

const socialButtonStyle = {
    width: 56,
    height: 56,
    borderRadius: 16,
    border: "1px solid rgba(147, 116, 68, 0.16)",
    background: "rgba(255,255,255,0.72)",
    display: "grid",
    placeItems: "center",
    color: "#a46c1f",
    fontSize: 22,
};

function CubeIcon() {
    return (
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <path d="M17 4 28 10.5v13L17 30 6 23.5v-13L17 4Z" stroke="currentColor" strokeWidth="1.8" />
            <path d="M17 4v26M6 10.5l11 6 11-6" stroke="currentColor" strokeWidth="1.8" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 7c.8-2.7 3.2-4 6-4s5.2 1.3 6 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7.5 10V8.5a4.5 4.5 0 1 1 9 0V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="5" y="10" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
    );
}

function FeatureIcon({ type }) {
    if (type === "shield") {
        return (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3 19 6v5c0 4.2-2.4 7.2-7 10-4.6-2.8-7-5.8-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" />
            </svg>
        );
    }

    if (type === "clock") {
        return (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
        );
    }

    if (type === "grid") {
        return (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" />
            </svg>
        );
    }

    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m12 4 1.8 2.6 3-.1.8 2.9 2.8 1.1-1.1 2.8 1.1 2.8-2.8 1.1-.8 2.9-3-.1L12 20l-1.8 2.6-3-.1-.8-2.9-2.8-1.1 1.1-2.8-1.1-2.8 2.8-1.1.8-2.9 3 .1L12 4Z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        </svg>
    );
}

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
                {decorationStyle.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            position: "absolute",
                            borderRadius: "50%",
                            filter: "blur(2px)",
                            ...item,
                        }}
                    />
                ))}
                <div
                    style={{
                        ...authCardStyle,
                        margin: "80px auto",
                        textAlign: "center",
                        maxWidth: 540,
                    }}
                >
                    <div style={{ ...logoBoxStyle, margin: "0 auto 22px" }}>
                        <CubeIcon />
                    </div>
                    <h1 style={{ margin: "0 0 10px", fontSize: 40 }}>秒杀系统</h1>
                    <p style={{ margin: 0, color: "#8b6d41" }}>正在校验登录状态...</p>
                </div>
            </div>
        );
    }

    if (!session.token || !session.user) {
        const features = [
            { icon: "shield", label: "安全可靠" },
            { icon: "clock", label: "高效协同" },
            { icon: "grid", label: "灵活扩展" },
            { icon: "spark", label: "稳定交付" },
        ];

        const socials = ["Q", "钉", "邮", "微"];

        return (
            <div style={shellStyle}>
                {decorationStyle.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            position: "absolute",
                            borderRadius: "50%",
                            filter: "blur(2px)",
                            ...item,
                        }}
                    />
                ))}

                <div style={layoutStyle}>
                    <section style={heroWrapStyle}>
                        <div style={heroContentStyle}>
                            <div style={heroBadgeStyle}>
                                <div style={logoBoxStyle}>
                                    <CubeIcon />
                                </div>
                                <div>
                                    <div
                                        style={{
                                            fontSize: "clamp(34px, 4.4vw, 56px)",
                                            lineHeight: 1.1,
                                            fontWeight: 800,
                                            letterSpacing: 1.5,
                                            color: "#fffaf0",
                                            textShadow: "0 10px 30px rgba(162, 93, 13, 0.14)",
                                        }}
                                    >
                                        秒杀系统
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 10,
                                            fontSize: "clamp(18px, 1.6vw, 26px)",
                                            letterSpacing: 8,
                                            color: "rgba(255, 249, 236, 0.88)",
                                        }}
                                    >
                                        FLASH SALE STUDIO
                                    </div>
                                </div>
                            </div>

                            <p
                                style={{
                                    margin: "0 0 12px",
                                    fontSize: "clamp(20px, 2vw, 30px)",
                                    color: "#fff6ea",
                                    letterSpacing: 2,
                                }}
                            >
                                企业级秒杀演示平台，让高并发流程更清晰
                            </p>
                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: "clamp(42px, 6vw, 78px)",
                                    lineHeight: 1.08,
                                    fontWeight: 900,
                                    color: "#fffdf5",
                                    textShadow: "0 16px 45px rgba(146, 78, 8, 0.18)",
                                }}
                            >
                                简约上手
                                <br />
                                稳定承接秒杀链路
                            </h1>

                            <div style={glassCardStyle}>
                                <p
                                    style={{
                                        margin: 0,
                                        color: "rgba(255, 248, 235, 0.95)",
                                        fontSize: 17,
                                        lineHeight: 2,
                                    }}
                                >
                                    从登录鉴权到库存预扣减、异步下单、结果反馈，整条链路已经串通。
                                    你只需要登录，即可进入秒杀控制台并体验完整的企业级核心流程。
                                </p>
                            </div>

                            <div
                                style={{
                                    marginTop: 44,
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 20,
                                }}
                            >
                                {features.map((item) => (
                                    <div
                                        key={item.label}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 12,
                                            color: "#fffaf0",
                                            fontSize: 19,
                                            fontWeight: 600,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 16,
                                                display: "grid",
                                                placeItems: "center",
                                                background: "rgba(255,255,255,0.18)",
                                                border: "1px solid rgba(255,255,255,0.16)",
                                                boxShadow: "0 10px 26px rgba(171, 106, 24, 0.12)",
                                            }}
                                        >
                                            <FeatureIcon type={item.icon} />
                                        </div>
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section style={authCardStyle}>
                        <div style={{ textAlign: "center", marginBottom: 26 }}>
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 46,
                                    color: "#2f2418",
                                    letterSpacing: 1,
                                }}
                            >
                                欢迎使用
                            </h2>
                            <p style={{ margin: "14px 0 0", color: "#9c7c4c", fontSize: 18 }}>
                                请登录您的账户继续使用
                            </p>
                        </div>

                        <div style={segmentStyle}>
                            {[
                                { key: "login", label: "登录" },
                                { key: "register", label: "注册" },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => switchMode(item.key)}
                                    style={{
                                        ...segmentButtonStyle,
                                        background: mode === item.key ? "rgba(255,255,255,0.92)" : "transparent",
                                        boxShadow:
                                            mode === item.key ? "0 8px 22px rgba(140, 102, 39, 0.1)" : "none",
                                        color: mode === item.key ? "#e67d1e" : "#97713f",
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ display: "grid", gap: 18 }}>
                                <div style={fieldStyle}>
                                    <span style={{ color: "#ba8330" }}>
                                        <UserIcon />
                                    </span>
                                    <input
                                        style={inputStyle}
                                        type="text"
                                        placeholder={mode === "login" ? "请输入用户名" : "创建您的用户名"}
                                        value={form.username}
                                        onChange={(event) =>
                                            setForm((current) => ({ ...current, username: event.target.value }))
                                        }
                                        autoComplete="username"
                                    />
                                </div>

                                <div style={fieldStyle}>
                                    <span style={{ color: "#ba8330" }}>
                                        <LockIcon />
                                    </span>
                                    <input
                                        style={inputStyle}
                                        type="password"
                                        placeholder={mode === "login" ? "请输入密码" : "请设置 6-64 位密码"}
                                        value={form.password}
                                        onChange={(event) =>
                                            setForm((current) => ({ ...current, password: event.target.value }))
                                        }
                                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                                    />
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 16,
                                        color: "#a48151",
                                        fontSize: 15,
                                    }}
                                >
                                    <span>{mode === "login" ? "登录后即可进入秒杀页面" : "注册成功后将自动登录"}</span>
                                    <span>{mode === "login" ? "JWT 安全鉴权" : "账号实时创建"}</span>
                                </div>

                                <button type="submit" disabled={submitting} style={submitButtonStyle}>
                                    {submitting ? "提交中..." : mode === "login" ? "登录" : "注册并进入"}
                                </button>
                            </div>
                        </form>

                        <p
                            style={{
                                minHeight: 28,
                                margin: "18px 0 22px",
                                color: authError ? "#cc5137" : "#2f8a52",
                                fontWeight: 700,
                                textAlign: "center",
                            }}
                        >
                            {authMessage}
                        </p>

                        <div style={{ marginTop: 36 }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 14,
                                    color: "#b49366",
                                    fontSize: 15,
                                    marginBottom: 24,
                                }}
                            >
                                <div style={{ flex: 1, height: 1, background: "rgba(180, 147, 102, 0.24)" }} />
                                其他体验入口
                                <div style={{ flex: 1, height: 1, background: "rgba(180, 147, 102, 0.24)" }} />
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                {socials.map((item) => (
                                    <div key={item} style={socialButtonStyle}>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
    }

    return (
        <div style={shellStyle}>
            {decorationStyle.map((item, index) => (
                <div
                    key={index}
                    style={{
                        position: "absolute",
                        borderRadius: "50%",
                        filter: "blur(2px)",
                        ...item,
                    }}
                />
            ))}
            <div
                style={{
                    width: "100%",
                    maxWidth: 1240,
                    margin: "0 auto",
                    position: "relative",
                    zIndex: 1,
                    paddingTop: 22,
                    paddingBottom: 22,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        gap: 18,
                        alignItems: "center",
                        marginBottom: 28,
                    }}
                >
                    <div>
                        <div
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 10,
                                padding: "10px 16px",
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.34)",
                                color: "#8d5613",
                                fontWeight: 700,
                            }}
                        >
                            <CubeIcon />
                            已登录
                        </div>
                        <h1 style={{ margin: "18px 0 10px", fontSize: "clamp(34px, 5vw, 52px)" }}>秒杀控制台</h1>
                        <p style={{ margin: 0, color: "#7c5d35", fontSize: 17 }}>
                            当前用户：<strong>{session.user.username}</strong>（ID {session.user.id}）
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => clearSession("你已退出登录")}
                        style={{
                            padding: "14px 20px",
                            borderRadius: 14,
                            border: "1px solid rgba(147, 116, 68, 0.18)",
                            background: "rgba(255,255,255,0.7)",
                            color: "#7a5219",
                            fontWeight: 700,
                            cursor: "pointer",
                        }}
                    >
                        退出登录
                    </button>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1.1fr) minmax(320px, 420px)",
                        gap: 24,
                    }}
                >
                    <section
                        style={{
                            padding: "34px 34px 38px",
                            borderRadius: 30,
                            background:
                                "linear-gradient(145deg, rgba(255,255,255,0.4) 0%, rgba(255,246,228,0.75) 100%)",
                            border: "1px solid rgba(255,255,255,0.42)",
                            boxShadow: "0 24px 60px rgba(178, 110, 22, 0.12)",
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        <div
                            style={{
                                display: "inline-flex",
                                padding: "8px 14px",
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.5)",
                                color: "#b36c16",
                                fontWeight: 700,
                                marginBottom: 18,
                            }}
                        >
                            认证已通过
                        </div>
                        <h2 style={{ margin: "0 0 14px", fontSize: "clamp(32px, 4vw, 48px)", lineHeight: 1.08 }}>
                            登录成功，进入
                            <br />
                            秒杀主场
                        </h2>
                        <p style={{ margin: 0, color: "#7f6238", fontSize: 17, lineHeight: 1.9, maxWidth: 620 }}>
                            现在发起的每一笔秒杀请求，都会带上你的 JWT 身份信息进入后端。库存预扣减、重复下单保护、结果轮询都会绑定到当前登录账号。
                        </p>
                    </section>

                    <section
                        style={{
                            padding: 28,
                            borderRadius: 28,
                            background: "rgba(255, 251, 243, 0.88)",
                            border: "1px solid rgba(255,255,255,0.46)",
                            boxShadow: "0 28px 56px rgba(163, 96, 16, 0.16)",
                            backdropFilter: "blur(10px)",
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
