import React from "react";
import { Card, Typography, Button, Space, Table, Tag } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom"; // ✅ Thêm hook điều hướng
import "../../style/voter/VoteSuccess.model.css";

const { Title, Text } = Typography;

const VoteSuccess: React.FC = () => {
  const navigate = useNavigate(); // ✅ Hook điều hướng

  const data = [
    { key: "1", label: "Mã xác nhận", value: "#VT2025-8472" },
    { key: "2", label: "Thời gian", value: "15/12/2025 - 14:35" },
    {
      key: "3",
      label: "Trạng thái",
      value: (
        <Tag
          color="#E8F5E9"
          style={{
            color: "#2E7D32",
            borderRadius: "20px",
            border: "1px solid #A5D6A7",
            fontWeight: 500,
            padding: "2px 12px",
          }}
        >
          ✓ Đã xác nhận
        </Tag>
      ),
    },
  ];

  const columns = [
    {
      title: "",
      dataIndex: "label",
      key: "label",
      width: "35%",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "",
      dataIndex: "value",
      key: "value",
      align: "right" as const,
    },
  ];

  return (
    <div className="vote-success-wrapper">
      <div className="vote-success-container">
        {/* ✅ Icon check */}
        <div className="success-icon-wrapper">
          <CheckCircleFilled className="success-icon" />
        </div>

        {/* ✅ Tiêu đề & mô tả */}
        <Title level={3} className="success-title">
          Bỏ phiếu thành công! 🎉
        </Title>
        <Text className="success-description">
          Cảm ơn bạn đã tham gia bỏ phiếu. Phiếu bầu của bạn đã được ghi nhận và
          lưu trữ an toàn trong hệ thống.
        </Text>

        {/* ✅ Bảng xác nhận */}
        <div className="success-table">
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            showHeader={false}
            bordered={false}
            rowClassName={() => "success-row"}
          />
        </div>

        {/* ✅ Nút hành động */}
        <Space className="success-buttons" size="middle">
          <Button
            className="home-btn"
            onClick={() => navigate("/")} // 👈 Quay lại trang chủ
          >
            Về trang chủ
          </Button>
          <Button
            className="result-btn"
            onClick={() => console.log("Xem kết quả")} // 👈 bạn có thể navigate("/result") nếu có trang kết quả
          >
            Xem kết quả
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default VoteSuccess;
