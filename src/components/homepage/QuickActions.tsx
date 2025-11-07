import React from "react";
import { Card, Button, Space, Tooltip, Divider } from "antd";
import {
    PlusOutlined,
    SearchOutlined,
    QuestionCircleOutlined,
    HistoryOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";

const QuickActions: React.FC = () => {
    const handleAction = (action: string) => {
        // Handle action click - có thể navigate hoặc mở modal
        console.log(`Action: ${action}`);
    };

    const actions = [
        {
            key: "create",
            label: "Tạo ủy quyền",
            icon: <PlusOutlined />,
            tooltip: "Tạo mới một ủy quyền bầu cử",
            primary: true,
        },
        {
            key: "search",
            label: "Tra cứu phiếu",
            icon: <SearchOutlined />,
            tooltip: "Tra cứu thông tin phiếu bầu của bạn",
            primary: false,
        },
        {
            key: "history",
            label: "Lịch sử bầu cử",
            icon: <HistoryOutlined />,
            tooltip: "Xem lịch sử các cuộc bầu cử đã tham gia",
            primary: false,
        },
        {
            key: "help",
            label: "Hướng dẫn",
            icon: <QuestionCircleOutlined />,
            tooltip: "Xem hướng dẫn sử dụng hệ thống",
            primary: false,
        },
    ];

    return (
        <Card
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                        style={{
                            width: 4,
                            height: 24,
                            background: "linear-gradient(180deg, #4caf50 0%, #81c784 100%)",
                            borderRadius: 2,
                        }}
                    />
                    <span style={{ fontWeight: 600, color: "#124d2d", letterSpacing: "0.3px" }}>
                        Hành động nhanh
                    </span>
                </div>
            }
            style={{
                borderRadius: 16,
                border: "1px solid rgba(230, 242, 234, 0.8)",
                boxShadow: "0 4px 24px rgba(18, 77, 45, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
            }}
            headStyle={{
                borderBottom: "1px solid rgba(230, 242, 234, 0.6)",
                padding: "16px 24px",
            }}
            bodyStyle={{
                padding: "24px",
            }}
        >
            <Space direction="vertical" style={{ width: "100%" }} size={12}>
                {actions.map((action, index) => (
                    <motion.div
                        key={action.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                        <Tooltip title={action.tooltip} placement="right">
                            <Button
                                type={action.primary ? "primary" : "default"}
                                icon={action.icon}
                                block
                                size="large"
                                onClick={() => handleAction(action.key)}
                                style={{
                                    ...(action.primary
                                        ? {
                                            background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                                            border: "none",
                                            boxShadow: "0 2px 8px rgba(76, 175, 80, 0.25)",
                                        }
                                        : {
                                            borderColor: "#a5d6a7",
                                            color: "#124d2d",
                                            background: "rgba(255, 255, 255, 0.8)",
                                        }),
                                    borderRadius: 10,
                                    fontWeight: 500,
                                    height: 44,
                                    transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (!action.primary) {
                                        e.currentTarget.style.borderColor = "#4caf50";
                                        e.currentTarget.style.color = "#4caf50";
                                        e.currentTarget.style.transform = "translateX(4px)";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!action.primary) {
                                        e.currentTarget.style.borderColor = "#a5d6a7";
                                        e.currentTarget.style.color = "#124d2d";
                                        e.currentTarget.style.transform = "translateX(0)";
                                    }
                                }}
                            >
                                {action.label}
                            </Button>
                        </Tooltip>
                    </motion.div>
                ))}

                <Divider style={{ margin: "16px 0", borderColor: "rgba(230, 242, 234, 0.6)" }} />

                <Tooltip title="Cài đặt hệ thống" placement="right">
                    <Button
                        icon={<SettingOutlined />}
                        block
                        size="middle"
                        style={{
                            borderRadius: 10,
                            borderColor: "#d9d9d9",
                            color: "#666",
                            fontWeight: 500,
                            height: 36,
                            background: "rgba(255, 255, 255, 0.8)",
                        }}
                        onClick={() => handleAction("settings")}
                    >
                        Cài đặt
                    </Button>
                </Tooltip>
            </Space>
        </Card>
    );
};

export default QuickActions;
