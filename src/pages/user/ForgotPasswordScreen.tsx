import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import AuthService from "@/services/AuthService";

const { Title, Text, Link } = Typography;

export default function ForgotPasswordScreen() {
  const [form] = Form.useForm();
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);

  const onFinish = async (values: any) => {
    try {
      showLoading();
      const response = await AuthService.sendOtp({ email: values.email });

      if (response.data.success) {
        setEmailSent(true);
        notify("Mã xác thực đã được gửi tới email của bạn!", "success");

        setTimeout(() => {
          navigate("/verify-forgot-password-otp", { state: { email: values.email } });
        }, 800);
      } else {
        notify(response.data.message || "Không thể gửi mã xác thực. Vui lòng thử lại.", "error");
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      notify(
        error?.response?.data?.message || "Không thể gửi mã xác thực. Vui lòng thử lại.",
        "error"
      );
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
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
          textAlign: "center",
          position: "relative",
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

        <Title level={3} style={{ marginBottom: "8px", color: "#333", fontWeight: "700" }}>
          Quên mật khẩu?
        </Title>

        <Text
          style={{
            color: "#666",
            display: "block",
            fontSize: "15px",
            lineHeight: 1.6,
            marginBottom: "26px",
          }}
        >
          Đừng lo lắng! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
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
          <div style={{ width: "50px", height: "4px", borderRadius: "4px", background: "#7cb342" }} />
          <div style={{ width: "50px", height: "4px", borderRadius: "4px", background: "#c8e6c9" }} />
          <div style={{ width: "50px", height: "4px", borderRadius: "4px", background: "#c8e6c9" }} />
        </div>

        <Form
          form={form}
          name="forgot-password"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          style={{ textAlign: "left" }}
        >
          <Form.Item
            label={<Text strong style={{ color: "#333", fontSize: "14px" }}>Email đã đăng ký</Text>}
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập địa chỉ email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#bbb" }} />}
              placeholder="Nhập địa chỉ email của bạn"
              size="large"
              style={{ borderRadius: "8px", height: "44px" }}
            />
          </Form.Item>

          {emailSent ? (
            <div
              style={{
                background: "#f1f8e9",
                border: "1px solid #c5e1a5",
                color: "#558b2f",
                padding: "10px 15px",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "16px",
                lineHeight: "1.5",
              }}
            >
              ✅ Mã xác thực đã được gửi tới email. Vui lòng kiểm tra cả hộp thư spam.
            </div>
          ) : (
            <div
              style={{
                background: "#f9fff4",
                border: "1px solid #e0f2f1",
                color: "#666",
                padding: "10px 15px",
                borderRadius: "8px",
                fontSize: "14px",
                marginBottom: "16px",
                lineHeight: "1.5",
              }}
            >
              💡 Mã xác thực sẽ được gửi đến email này. Vui lòng kiểm tra cả hộp thư spam.
            </div>
          )}

          <Form.Item style={{ marginBottom: "8px" }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{
                background: "#7cb342",
                borderColor: "#7cb342",
                height: "46px",
                fontSize: "16px",
                fontWeight: "500",
                borderRadius: "8px",
              }}
            >
              Gửi mã xác thực
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: "20px" }}>
          <Link href="/login" style={{ color: "#7cb342", fontSize: "14px" }}>
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
