import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Progress } from "antd";
import {
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNotification } from "@/contexts/NotificationContext";
import { useLoading } from "@/contexts/LoadingContext";
import UserService from "@/services/UserService";
import { USER_ROLE } from "@/enums/STATUS";
import { useNavigate } from "react-router-dom";
import { PATH } from "@/enums/PATH";
import loginBackground from "@/assets/login_background.png";
import { getUserLogin } from "@/utils/auth";

const { Title, Text, Link } = Typography;

export default function FirstTimeChangePasswordScreen() {
  const [form] = Form.useForm();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { notify } = useNotification();
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    return strength;
  };

  const onFinish = async (values: any) => {
    try {
      showLoading();
      let body = {
        oldPassword: values.currentPassword,
        newPassword: values.newPassword,
        userId: localStorage.getItem("userId"),
      };
      const response = await UserService.changePassword(body);
      if (response.success) {
        notify(response.message, "success");
        const user = await getUserLogin();
        if (user?.email) {
          localStorage.setItem("email", user.email);
        }
        let role = localStorage.getItem("role");
        if (role === USER_ROLE.ADMIN) {
          navigate(PATH.ADMIN);
        } else if (role === USER_ROLE.PRESIDE) {
          navigate(PATH.PRESIDE);
        } else {
          navigate(PATH.HOME);
        }
      } else {
        notify(response.message, "error");
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
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

  useEffect(() => {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "#f44336";
    if (passwordStrength < 70) return "#ff9800";
    return "#7cb342";
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return "Yếu";
    if (passwordStrength < 70) return "Trung bình";
    return "Mạnh";
  };

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
          width: "460px",
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

        <Title
          level={3}
          style={{ marginBottom: "8px", color: "#333", fontWeight: "700" }}
        >
          Đổi mật khẩu lần đầu
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
          Vì lý do bảo mật, bạn cần đặt mật khẩu mới cho lần đăng nhập đầu tiên.
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
              background: "#c8e6c9",
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

        <Form
          form={form}
          name="first-time-change-password"
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          style={{ textAlign: "left" }}
        >
          <Form.Item
            label={
              <Text strong style={{ color: "#333", fontSize: "14px" }}>
                Mật khẩu hiện tại
              </Text>
            }
            name="currentPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bbb" }} />}
              placeholder="Nhập mật khẩu tạm thời"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              style={{ borderRadius: "8px", height: "44px" }}
            />
          </Form.Item>

          <Form.Item
            label={
              <Text strong style={{ color: "#333", fontSize: "14px" }}>
                Mật khẩu mới
              </Text>
            }
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: "Mật khẩu phải chứa chữ hoa, chữ thường và số!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bbb" }} />}
              placeholder="Nhập mật khẩu mới"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              style={{ borderRadius: "8px", height: "44px" }}
              onChange={(e) =>
                setPasswordStrength(calculatePasswordStrength(e.target.value))
              }
            />
          </Form.Item>

          {form.getFieldValue("newPassword") && (
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "6px",
                }}
              >
                <Text style={{ fontSize: "13px", color: "#666" }}>
                  Độ mạnh mật khẩu:
                </Text>
                <Text
                  style={{
                    fontSize: "13px",
                    color: getStrengthColor(),
                    fontWeight: "500",
                  }}
                >
                  {getStrengthText()}
                </Text>
              </div>
              <Progress
                percent={passwordStrength}
                strokeColor={getStrengthColor()}
                showInfo={false}
                style={{ marginBottom: "4px" }}
              />
            </div>
          )}

          <Form.Item
            label={
              <Text strong style={{ color: "#333", fontSize: "14px" }}>
                Xác nhận mật khẩu mới
              </Text>
            }
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bbb" }} />}
              placeholder="Xác nhận mật khẩu"
              size="large"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              style={{ borderRadius: "8px", height: "44px" }}
            />
          </Form.Item>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Button
              // type="primary"
              htmlType="submit"
              style={{ width: "100%", borderRadius: "8px" }}
              size="large"
            >
              Đổi mật khẩu
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
