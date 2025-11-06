import React from "react";
import { Card, Button, Space } from "antd";

const QuickActions: React.FC = () => (
    <Card
        title="Hành động nhanh"
        style={{
            borderRadius: 16,
            border: "1px solid #e6f2ea",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
    >
        <Space wrap>
            <Button
                type="primary"
                style={{
                    background: "#3ca860",
                    borderColor: "#3ca860",
                    borderRadius: 8,
                    fontWeight: 500,
                }}
            >
                Tạo ủy quyền
            </Button>
            <Button
                style={{
                    borderRadius: 8,
                    borderColor: "#a5d6a7",
                    color: "#124d2d",
                }}
            >
                Tra cứu phiếu
            </Button>
            <Button
                style={{
                    borderRadius: 8,
                    borderColor: "#a5d6a7",
                    color: "#124d2d",
                }}
            >
                Hướng dẫn
            </Button>
        </Space>
    </Card>
);

export default QuickActions;
