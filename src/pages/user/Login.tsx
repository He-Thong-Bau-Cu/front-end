import React, { useEffect } from "react";
import { Form, Input, Button, Checkbox, Typography } from "antd";
import {
  UserOutlined,
  LockOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import ElectionService from "@/services/ElectionService";
import AuthService from "@/services/AuthService";
import { useNavigate } from "react-router-dom";
import { PATH } from "@/enums/PATH";
import { getUserLogin, setLocalStorage } from "@/utils/auth";
import { jwtDecode } from "jwt-decode";
import { USER_ROLE } from "@/enums/STATUS";

const { Title, Text, Link } = Typography;

export default function LoginScreen() {
  const [form] = Form.useForm();
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {}, []);

  const onFinish = async (values: any) => {
    try {
      showLoading();
      const response = await AuthService.login(values);
      if (response.data.success) {
        if (response.data.data.requireTwoFa) {
          navigate(PATH.VERIFY_EMAIL, {
            state: {
              userId: response.data.data.userId,
              isSetting: response.data.data.isSetting,
            },
          });
          notify("Đang chuyển hướng ...", "info");
        } else {
          const data = response.data.data;
          const decoded = jwtDecode(data.accessToken) as any;
          setLocalStorage(
            data.accessToken,
            decoded.sub,
            decoded.role,
            decoded.fullname,
            decoded.permissions || []
          );
          notify(data.message, "success");
          if (decoded.role === USER_ROLE.ADMIN) {
          } else if (decoded.role === USER_ROLE.PRESIDE) {
          } else {
            const user = await getUserLogin();
            if (user && user.isTempPassword) {
              navigate(PATH.CHANGE_PASSWORD_FIRST_TIME);
            } else {
              navigate(PATH.HOME);
            }
          }
        }
      } else {
        notify(response.data.message, "error");
      }
    } catch (error) {
      notify("Đăng nhập thất bại. Vui lòng thử lại.", "error");
    } finally {
      hideLoading();
    }
  };

  // Reset body styles
  React.useEffect(() => {
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
        margin: 0,
        position: "fixed",
        top: 0,
        left: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          maxWidth: "1200px",
          width: "100%",
          background: "rgba(255, 255, 255, 0.15)",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Left Panel */}
        <div
          style={{
            flex: 1,
            padding: "60px 40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
          }}
        >
          <div
            style={{
              width: "120px",
              height: "120px",
              background: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "30px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            }}
          >
            <BarChartOutlined style={{ fontSize: "50px", color: "#7cb342" }} />
          </div>
          <Title
            level={2}
            style={{
              color: "white",
              marginBottom: "16px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Hệ thống Bầu cử
          </Title>
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontSize: "16px",
              opacity: 0.95,
              maxWidth: "400px",
              lineHeight: "1.6",
            }}
          >
            Nền tảng bầu cử điện tử an toàn, minh bạch và hiện đại cho một nền
            dân chủ công bằng
          </Text>
        </div>

        {/* Right Panel - Login Form */}
        <div
          style={{
            width: "480px",
            background: "white",
            padding: "60px 50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Title level={3} style={{ marginBottom: "8px", color: "#333" }}>
            Đăng nhập
          </Title>
          <Text
            style={{ color: "#666", marginBottom: "32px", display: "block" }}
          >
            Chào mừng bạn quay trở lại! Vui lòng đăng nhập để tiếp tục.
          </Text>

          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              label="Tên đăng nhập hoặc Email"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên đăng nhập hoặc email!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#bbb" }} />}
                placeholder="Nhập tên đăng nhập hoặc email"
                size="large"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bbb" }} />}
                placeholder="Nhập mật khẩu"
                size="large"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <Link href="/forgotPassword" style={{ color: "#7cb342" }}>
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                style={{
                  background: "#7cb342",
                  borderColor: "#7cb342",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "500",
                  borderRadius: "8px",
                }}
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
