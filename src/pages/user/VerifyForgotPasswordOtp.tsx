import React, { useEffect, useRef, useState, createRef } from "react";
import { Input, Button, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useLoading } from "@/contexts/LoadingContext";
import AuthService from "@/services/AuthService";
import { useNotification } from "@/contexts/NotificationContext";
import { LockOutlined } from "@ant-design/icons";
import loginBackground from "@/assets/login_background.png";

const { Title, Text, Link } = Typography;

export default function VerifyForgotPasswordOtp() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [countdown, setCountdown] = useState(0);
  const inputsRef = useRef(Array.from({ length: 6 }, () => createRef<any>()));
  const location = useLocation();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      notify("Email không hợp lệ. Vui lòng quay lại.", "error");
      navigate("/forgotPassword");
    }
  }, [email, navigate, notify]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].current?.focus();
    }
  };

  const handleSubmit = async () => {
    try {
      const code = otp.join("");
      if (code.length !== 6) {
        notify("Vui lòng nhập đủ 6 chữ số", "error");
        return;
      }

      showLoading();
      const response = await AuthService.verifyOtp({
        email: email,
        otp: code,
      });

      if (response.data.success) {
        notify("Xác thực OTP thành công!", "success");

        // Sau khi verify OTP thành công, gọi forward password
        setTimeout(async () => {
          try {
            showLoading();
            const forwardResponse = await AuthService.forwardPassword({
              email: email,
            });

            if (forwardResponse.data.success) {
              notify(
                "Mật khẩu mới đã được gửi đến email của bạn. Vui lòng kiểm tra email!",
                "success"
              );
              setTimeout(() => {
                navigate("/login");
              }, 2000);
            } else {
              notify(
                forwardResponse.data.message ||
                  "Không thể gửi mật khẩu mới. Vui lòng thử lại.",
                "error"
              );
            }
          } catch (error: any) {
            console.error("Error forwarding password:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Không thể gửi mật khẩu mới. Vui lòng thử lại.";
            console.error("Error message from response:", errorMessage);
            console.error("Error response:", error?.response?.data);
            notify(errorMessage, "error");
          } finally {
            hideLoading();
          }
        }, 500);
      } else {
        notify(response.data.message || "Mã OTP không đúng!", "error");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Mã OTP không đúng. Vui lòng thử lại.";
      console.error("Error message from response:", errorMessage);
      console.error("Error response:", error?.response?.data);
      notify(errorMessage, "error");
    } finally {
      hideLoading();
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    try {
      showLoading();
      const response = await AuthService.sendOtp({ email: email });

      if (response.data.success) {
        notify("Mã OTP mới đã được gửi đến email của bạn!", "success");
        setCountdown(60); // Reset countdown to 60 seconds
        setOtp(Array(6).fill("")); // Clear OTP inputs
        inputsRef.current[0].current?.focus(); // Focus first input
      } else {
        notify(
          response.data.message || "Không thể gửi mã OTP. Vui lòng thử lại.",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Error resending OTP:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể gửi mã OTP. Vui lòng thử lại.";
      console.error("Error message from response:", errorMessage);
      console.error("Error response:", error?.response?.data);
      notify(errorMessage, "error");
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            backgroundColor: "#e8f5e9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <LockOutlined style={{ fontSize: "28px", color: "#7cb342" }} />
        </div>

        <Title
          level={3}
          style={{ marginBottom: "8px", color: "#333", fontWeight: "700" }}
        >
          Xác thực OTP
        </Title>

        <Text
          style={{
            color: "#666",
            display: "block",
            fontSize: "15px",
            lineHeight: 1.6,
            marginBottom: "8px",
          }}
        >
          Nhập mã xác thực 6 chữ số đã được gửi đến email của bạn
        </Text>

        <Text
          style={{
            color: "#7cb342",
            fontWeight: 600,
            marginBottom: "26px",
            display: "block",
          }}
        >
          {email}
        </Text>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "6px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "4px",
              borderRadius: "4px",
              background: "#7cb342",
            }}
          />
          <div
            style={{
              width: "50px",
              height: "4px",
              borderRadius: "4px",
              background: "#7cb342",
            }}
          />
          <div
            style={{
              width: "50px",
              height: "4px",
              borderRadius: "4px",
              background: "#c8e6c9",
            }}
          />
        </div>

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

        <Button
          type="primary"
          onClick={handleSubmit}
          block
          size="large"
          style={{
            background: "#7cb342",
            borderColor: "#7cb342",
            height: "46px",
            fontSize: "16px",
            fontWeight: "500",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          Xác thực
        </Button>

        <div
          style={{
            borderTop: "1px solid #eee",
            paddingTop: 16,
            color: "#666",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          <div style={{ marginBottom: 8 }}>
            Không nhận được mã?{" "}
            {countdown > 0 ? (
              <span style={{ color: "#9e9e9e" }}>
                Gửi lại sau {countdown}s
              </span>
            ) : (
              <Link
                href="#"
                onClick={handleResendOtp}
                style={{ color: "#7cb342" }}
              >
                Gửi lại mã
              </Link>
            )}
          </div>

          <Link href="/login" style={{ color: "#7cb342", fontSize: "14px" }}>
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

