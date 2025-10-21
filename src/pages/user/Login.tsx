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

const { Title, Text, Link } = Typography;

export default function LoginScreen() {
  const [form] = Form.useForm();
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      let body = {
        title: "Đại hội đồng cổ đông 2025",
        type: "Annual Meeting",
        startDate: "2025-10-15T08:00:00Z",
        endDate: "2025-10-15T12:00:00Z",
        status: "active",
        companyType: "Joint-stock",
      };
      const response = await ElectionService.search(body);
      console.log(response);
    } catch (error) {
      notify("Đã có lỗi xảy ra khi tải dữ liệu", "error");
    }
  };

  const onFinish = (values: any) => {
    console.log("Login values:", values);
    setTimeout(() => {
      showLoading();
      setTimeout(() => {
        hideLoading();
        notify("Đăng nhập thành công!", "success");
      }, 1000);
    }, 500);

    // Xử lý đăng nhập ở đây
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
