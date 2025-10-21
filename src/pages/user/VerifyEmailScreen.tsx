import React, { useEffect, useRef, useState, createRef } from "react";
import { Input, Button, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

const { Title, Text, Link } = Typography;

export default function VerifyEmailScreen() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [countdown, setCountdown] = useState(60);
  const inputsRef = useRef(Array.from({ length: 6 }, () => createRef<any>()));
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "user@example.com";

  useEffect(() => {
    const timer = countdown > 0 && setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer as any);
  }, [countdown]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      inputsRef.current[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].current?.focus();
    }
  };

  const handleSubmit = () => {
    const code = otp.join("");
    if (code.length !== 6) return alert("Vui lòng nhập đủ 6 chữ số");
    navigate("/reset-password");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          width: "420px",
          padding: "50px 40px 40px",
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          textAlign: "center",
        }}
      >
        {/* Icon phong bì */}
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "#e8f5e9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7cb342"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <polyline points="3 7 12 13 21 7" />
          </svg>
        </div>

        {/* Tiêu đề */}
        <Title
          level={3}
          style={{
            marginBottom: "8px",
            color: "#333",
            fontWeight: "700",
          }}
        >
          Xác thực Email
        </Title>

        <Text
          style={{
            color: "#666",
            display: "block",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          Chúng tôi đã gửi mã xác thực 6 chữ số đến email của bạn
        </Text>

        <Text
          style={{
            color: "#7cb342",
            fontWeight: 600,
            marginTop: 4,
            marginBottom: 8,
            display: "block",
          }}
        >
          {email}
        </Text>

        <Text
          style={{
            color: "#999",
            fontSize: "13px",
            marginBottom: "26px",
            display: "block",
          }}
        >
          Vui lòng kiểm tra hộp thư hoặc thư mục spam
        </Text>

        {/* Thanh tiến trình */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
            marginBottom: "32px",
          }}
        >
          <div style={{ width: "50px", height: "4px", borderRadius: "4px", background: "#7cb342" }} />
          <div style={{ width: "50px", height: "4px", borderRadius: "4px", background: "#7cb342" }} />
          <div style={{ width: "50px", height: "4px", borderRadius: "4px", background: "#c8e6c9" }} />
        </div>

        {/* Ô nhập OTP */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 10,
            marginBottom: 26,
          }}
        >
          {otp.map((digit, i) => (
            <Input
              key={i}
              ref={inputsRef.current[i]}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              maxLength={1}
              inputMode="numeric"
              style={{
                width: 45,
                height: 50,
                textAlign: "center",
                fontSize: 20,
                borderRadius: 8,
                border: "1px solid #ddd",
              }}
            />
          ))}
        </div>

        {/* Nút xác thực */}
        <Button
          type="primary"
          onClick={handleSubmit}
          block
          size="large"
          style={{
            background: "#A5D6A7",
            borderColor: "#A5D6A7",
            color: "#333",
            height: 46,
            fontSize: 16,
            fontWeight: 500,
            borderRadius: 8,
            marginBottom: 30,
          }}
        >
          Xác thực
        </Button>

        {/* Phần resend + link */}
        <div
          style={{
            borderTop: "1px solid #eee",
            paddingTop: 16,
            color: "#666",
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          <div style={{ marginBottom: 6 }}>
            Không nhận được mã?{" "}
            {countdown > 0 ? (
              <span style={{ color: "#9e9e9e" }}>Gửi lại sau {countdown}s</span>
            ) : (
              <Link href="#" style={{ color: "#7cb342" }}>
                Gửi lại sau
              </Link>
            )}
          </div>

          {/* ✅ Dòng “Gửi lại mã xác thực” riêng biệt như hình */}
          <div style={{ marginBottom: 8 }}>
            <Link href="#" style={{ color: "#7cb342" }}>
              Gửi lại mã xác thực
            </Link>
          </div>

          <Link href="/login" style={{ color: "#7cb342", fontSize: "14px" }}>
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
