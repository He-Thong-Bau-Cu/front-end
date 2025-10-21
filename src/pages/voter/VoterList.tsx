import React from "react";
import { Layout, Menu, Button, Upload, Table, Input, Typography, Space } from "antd";
import {
  UserOutlined,
  UploadOutlined,
  FileAddOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Sider, Header, Content } = Layout;
const { Title, Text } = Typography;

export default function DelegateUploadScreen() {
  const columns = [
    {
      title: "HỌ VÀ TÊN",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "MÃ ĐỊNH DANH",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "EMAIL",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "ĐƠN VỊ / NHÓM",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "VAI TRÒ",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "HÀNH ĐỘNG",
      key: "actions",
      render: () => (
        <Space>
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  const dataSource = [
    {
      key: 1,
      name: "Nguyễn Thị Lan Anh",
      id: "NV0078",
      email: "lan.anh@example.com",
      department: "Phòng Kinh doanh",
      role: "Đại biểu",
    },
    {
      key: 2,
      name: "Trần Minh Hoàng",
      id: "NV0015",
      email: "minh.hoang@example.com",
      department: "Cổ đông",
      role: "Cổ đông",
    },
    {
      key: 3,
      name: "Lê Gia Bảo",
      id: "NV0023",
      email: "gia.bao@example.com",
      department: "Phòng Kỹ thuật",
      role: "Đại biểu",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f8faf5" }}>
      {/* Sidebar */}
      <Sider
        width={250}
        style={{
          background: "#eaf4e0",
          borderRight: "1px solid #d0e6c3",
          paddingTop: 20,
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 30,
            color: "#4d7c0f",
            fontWeight: 700,
            fontSize: "18px",
          }}
        >
          <UserOutlined style={{ marginRight: 8 }} />
          Hệ thống bầu cử
        </div>

        <Menu
          defaultSelectedKeys={["4"]}
          mode="inline"
          style={{ background: "transparent", border: "none" }}
          items={[
            { key: "1", icon: <HomeOutlined />, label: "Tổng quan" },
            { key: "2", icon: <CheckCircleOutlined />, label: "Checkin" },
            { key: "3", icon: <TeamOutlined />, label: "Xác thực đại biểu" },
            {
              key: "4",
              icon: <UploadOutlined />,
              label: (
                <span style={{ color: "#4d7c0f", fontWeight: 600 }}>
                  Nhập danh sách đại biểu và cổ đông
                </span>
              ),
            },
          ]}
        />
      </Sider>

      {/* Main Layout */}
      <Layout>
        <Header
          style={{
            background: "#f1f8e9",
            padding: "0 30px",
            borderBottom: "1px solid #e0e0e0",
            fontWeight: 600,
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>Nhập danh sách đại biểu và cổ đông</span>
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "6px 12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <UserOutlined style={{ marginRight: 6 }} />
            Thành viên ban tổ chức
          </div>
        </Header>

        <Content style={{ padding: "40px 50px" }}>
          <Title level={3} style={{ color: "#2e2e2e", marginBottom: 4 }}>
            Quản lý Danh sách Đại biểu & Cổ đông
          </Title>
          <Text style={{ color: "#666", fontSize: 15 }}>
            Thêm mới, nhập và quản lý danh sách người tham dự cho sự kiện của bạn.
          </Text>

          <div style={{ display: "flex", gap: "20px", marginTop: 30 }}>
            {/* Khối Upload */}
            <div
              style={{
                flex: 2,
                border: "1px dashed #c8e6c9",
                borderRadius: "10px",
                background: "#fff",
                padding: "24px",
                textAlign: "center",
              }}
            >
              <Title level={5} style={{ marginBottom: 20 }}>
                📁 Nhập từ File
              </Title>

              <div
                style={{
                  border: "2px dashed #c5e1a5",
                  borderRadius: "8px",
                  padding: "30px 20px",
                  background: "#fcfffa",
                  marginBottom: 10,
                }}
              >
                <Text>Kéo và thả file Excel hoặc CSV vào đây</Text>
                <br />
                <Text style={{ color: "#9e9e9e" }}>hoặc</Text>
                <br />
                <Button
                  type="primary"
                  style={{
                    background: "#8bc34a",
                    borderColor: "#8bc34a",
                    marginTop: 10,
                  }}
                >
                  Chọn file từ máy tính
                </Button>
              </div>
              <a href="#" style={{ color: "#558b2f", fontSize: 13 }}>
                Tải file mẫu (.xlsx) để đảm bảo đúng định dạng.
              </a>
            </div>

            {/* Khối thêm thủ công */}
            <div
              style={{
                flex: 1,
                background: "#fff",
                borderRadius: "10px",
                padding: "24px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                height: "fit-content",
              }}
            >
              <Title level={5}>👤 Thêm Thủ công</Title>
              <Text style={{ color: "#666", fontSize: 14 }}>
                Thêm nhanh một đại biểu mới vào danh sách mà không cần dùng file.
              </Text>
              <Button
                icon={<FileAddOutlined />}
                type="primary"
                block
                style={{
                  marginTop: 20,
                  background: "#7cb342",
                  borderColor: "#7cb342",
                  height: 44,
                  borderRadius: 8,
                  fontWeight: 500,
                }}
              >
                + Thêm Đại biểu mới
              </Button>
            </div>
          </div>

          {/* Bảng danh sách */}
          <div
            style={{
              marginTop: 40,
              background: "#fff",
              borderRadius: "10px",
              padding: "20px 24px",
            }}
          >
            <Input
              placeholder="Tìm kiếm đại biểu..."
              style={{
                marginBottom: 16,
                borderRadius: 8,
                height: 38,
                width: "40%",
              }}
            />

            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              rowSelection={{}}
              bordered={false}
              style={{ marginBottom: 20 }}
            />

            <Button
              danger
              icon={<DeleteOutlined />}
              style={{
                background: "#fdecea",
                color: "#c62828",
                border: "none",
                height: 40,
                borderRadius: 8,
                fontWeight: 500,
              }}
            >
              Xóa các mục đã chọn
            </Button>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
