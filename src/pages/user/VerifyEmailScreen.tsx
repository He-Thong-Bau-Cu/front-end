import React, { useEffect, useRef, useState, createRef } from "react";
import { Input, Button, Typography, Progress } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useLoading } from "@/contexts/LoadingContext";
import AuthService from "@/services/AuthService";
import { useNotification } from "@/contexts/NotificationContext";
import { getUserLogin, setLocalStorage } from "@/utils/auth";
import { jwtDecode } from "jwt-decode";
import { PATH } from "@/enums/PATH";
import { time } from "console";
import { USER_ROLE } from "@/enums/STATUS";
import loginBackground from "@/assets/login_background.png";

const { Title, Text, Link } = Typography;

export default function VerifyEmailScreen() {
  const [step, setStep] = useState("qr");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [countdown, setCountdown] = useState(30);
  const inputsRef = useRef(Array.from({ length: 6 }, () => createRef<any>()));
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, isSetting } = location.state || {};
  const { showLoading, hideLoading } = useLoading();
  const [qrBase64, setQrBase64] = useState<string>("");
  const { notify } = useNotification();

  const email = location.state?.email || "user@example.com";

  useEffect(() => {
    if (isSetting) {
      setStep("otp");
    } else {
      if (step === "otp") return;
      fetchQrCode(userId);
      setStep("qr");
    }
  }, [countdown, step]);

  const fetchQrCode = async (userId: string) => {
    try {
      showLoading();
      let body = {
        userId: userId,
      };
      const response = await AuthService.setupTwoFa(body);
      if (response.data.success) {
        setQrBase64(response.data.data.qrCode);
        notify(response.data.message, "success");
      } else {
        notify(response.data.message, "error");
      }
    } catch (error: any) {
      console.error("Error fetching QR code:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Đã có lỗi xảy ra. Vui lòng thử lại.";
      console.error("Error message from response:", errorMessage);
      console.error("Error response:", error?.response?.data);
      notify(errorMessage, "error");
    } finally {
      hideLoading();
    }
  };

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
      showLoading();
      const code = otp.join("");
      if (code.length !== 6) return alert("Vui lòng nhập đủ 6 chữ số");
      if (!userId) {
        notify("ID người dùng không hợp lệ.", "error");
        return;
      }
      let body = {
        userId: userId,
        token: code,
      };
      const response = await AuthService.twoFaLogin(body);
      if (response.data.success) {
        notify("Đăng nhập thành công!!!", "success");
        const data = response.data.data;
        const decoded = jwtDecode(data.accessToken) as any;
        setLocalStorage(
          data.accessToken,
          decoded.sub,
          decoded.role,
          decoded.fullname,
          decoded.permissions || []
        );

        const user = await getUserLogin();
        if (user?.email) {
          localStorage.setItem("email", user.email);
        }
        if (decoded.role === USER_ROLE.ADMIN) {
          navigate(PATH.ADMIN);
        } else if (decoded.role === USER_ROLE.PRESIDE && user.chairmanOfTheBoardOfDirectors) {
          decoded.permissions.push(PATH.PRESIDE_APPROVED_REQ_FROM_USER);
          localStorage.setItem("permissions", JSON.stringify(decoded.permissions));
          navigate(PATH.PRESIDE);
        } else {
          const user = await getUserLogin();
          if (user && user.isTempPassword) {
            navigate(PATH.CHANGE_PASSWORD_FIRST_TIME);
          } else {
            navigate(PATH.HOME);
          }
        }
      } else {
        notify(response.data.message, "error");
      }
    } catch (error: any) {
      console.error("Error submitting OTP:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Đã có lỗi xảy ra. Vui lòng thử lại.";
      notify(errorMessage, "error");
    } finally {
      hideLoading();
    }
  };

  const handleQrScanned = () => {
    setStep("otp");
  };

  // Màn hình QR Setup
  if (step === "qr") {
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
          overflowY: "hidden",
          overflowX: "hidden",
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
          {/* Icon khóa bảo mật */}
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
              <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
              <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
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
            Thiết lập xác thực 2 yếu tố
          </Title>

          <Text
            style={{
              color: "#666",
              display: "block",
              fontSize: "15px",
              lineHeight: 1.6,
              marginBottom: "24px",
            }}
          >
            Quét mã QR bằng ứng dụng xác thực của bạn
            <br />
            (Google Authenticator, Authy, etc.)
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
            <div
              style={{
                width: "50px",
                height: "4px",
                borderRadius: "4px",
                background: "#c8e6c9",
              }}
            />
          </div>

          {/* QR Code */}
          <div
            style={{
              background: "#f5f5f5",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "20px",
              border: "2px solid #e0e0e0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "200px",
                height: "200px",
                margin: "0 auto",
                background: "white",
                padding: "10px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={`${qrBase64}`}
                alt="QR Code"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </div>
          </div>

          {/* Nút tiếp tục */}
          <Button
            type="primary"
            onClick={handleQrScanned}
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
              marginBottom: 20,
            }}
          >
            Tôi đã quét mã QR
          </Button>

          {/* Link quay lại */}
          <Link href="/login" style={{ color: "#7cb342", fontSize: "14px" }}>
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  // Màn hình nhập OTP
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
        overflowY: "hidden",
        overflowX: "hidden",
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
          Xác thực tài khoản của bạn
        </Title>

        <Text
          style={{
            color: "#666",
            display: "block",
            fontSize: "15px",
            lineHeight: 1.6,
          }}
        >
          Nhập mã xác thực 6 chữ số từ ứng dụng xác thực
        </Text>

        <Text
          style={{
            color: "#999",
            fontSize: "13px",
            marginBottom: "26px",
            display: "block",
          }}
        >
          Mở ứng dụng Google Authenticator hoặc ứng dụng xác thực bạn đã sử dụng
          để lấy mã.
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
          {/* <div style={{ marginBottom: 6 }}>
            Không nhận được mã?{" "}
            {countdown > 0 ? (
              <span style={{ color: "#9e9e9e" }}>Gửi lại sau {countdown}s</span>
            ) : (
              <Link href="#" style={{ color: "#7cb342" }}>
                Gửi lại mã
              </Link>
            )}
          </div> */}

          {isSetting ? null : (
            <div style={{ marginBottom: 8 }}>
              <Link
                href="#"
                onClick={() => setStep("qr")}
                style={{ color: "#7cb342" }}
              >
                ← Quay lại quét QR
              </Link>
            </div>
          )}

          <Link href="/login" style={{ color: "#7cb342", fontSize: "14px" }}>
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
