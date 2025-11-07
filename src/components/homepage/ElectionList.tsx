import {
    CalendarOutlined,
    UserOutlined,
    EyeOutlined,
    RightOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    FireOutlined,
} from "@ant-design/icons";
import { Card, List, Tag, Typography, Button, Space, Tooltip, Progress } from "antd";
import { motion } from "framer-motion";
import React from "react";

const { Text } = Typography;

interface ElectionItem {
    id: string | number;
    title: string;
    startDate: string;
    endDate?: string;
    status: "upcoming" | "completed" | "ongoing";
    role: string;
    actionLabel: string;
    actionType: "green" | "blue";
    participants?: number;
    progress?: number; // 0-100 for ongoing elections
    totalVoters?: number;
}

const ElectionList: React.FC = () => {
    const elections: ElectionItem[] = [
        {
            id: 1,
            title: "Bầu cử nghị quyết số 30",
            startDate: "15/11/2025",
            endDate: "20/11/2025",
            status: "upcoming",
            role: "Chủ tọa",
            actionLabel: "Xem nghị quyết",
            actionType: "green",
            participants: 45,
            totalVoters: 50,
        },
        {
            id: 2,
            title: "Bầu cử Phó chủ tịch hội đồng quản trị khóa 10",
            startDate: "20/11/2025",
            endDate: "25/11/2025",
            status: "upcoming",
            role: "Đại biểu",
            actionLabel: "Xem ứng viên",
            actionType: "green",
            participants: 38,
            totalVoters: 45,
        },
        {
            id: 3,
            title: "Bầu cử bãi nhiệm tổng giám đốc",
            startDate: "25/08/2025",
            endDate: "30/08/2025",
            status: "completed",
            role: "Quan sát viên",
            actionLabel: "Xem kết quả",
            actionType: "blue",
            participants: 52,
            totalVoters: 55,
            progress: 100,
        },
        {
            id: 4,
            title: "Bầu cử tăng vốn đầu tư",
            startDate: "10/05/2025",
            endDate: "15/05/2025",
            status: "completed",
            role: "Thành viên HĐQT",
            actionLabel: "Xem kết quả",
            actionType: "blue",
            participants: 40,
            totalVoters: 42,
            progress: 100,
        },
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "upcoming":
                return <ClockCircleOutlined style={{ color: "#d48806" }} />;
            case "completed":
                return <CheckCircleOutlined style={{ color: "#1677ff" }} />;
            default:
                return <ClockCircleOutlined />;
        }
    };

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
                    <Text strong className="election-title">
                        Các kỳ bầu cử
                    </Text>
                </div>
            }
            extra={
                <Tooltip title="Xem tất cả cuộc bầu cử">
                    <Text className="view-all" style={{ cursor: "pointer" }}>
                        Xem tất cả <RightOutlined />
                    </Text>
                </Tooltip>
            }
            className="election-card"
            headStyle={{
                borderBottom: "1px solid rgba(230, 242, 234, 0.6)",
                padding: "20px 28px",
            }}
        >
            <List
                dataSource={elections}
                renderItem={(item, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                        <List.Item className="election-item">
                            <div style={{ width: "100%" }}>
                                <div className="election-header">
                                    <div style={{ flex: 1, paddingRight: 12 }}>
                                        <Space align="start" size={8}>
                                            {getStatusIcon(item.status)}
                                            <Text strong className="election-item-title" style={{ fontSize: 16 }}>
                                                {item.title}
                                            </Text>
                                        </Space>
                                    </div>
                                    <Tag
                                        className={`status-tag ${item.status === "upcoming" ? "tag-upcoming" : "tag-completed"
                                            }`}
                                        icon={getStatusIcon(item.status)}
                                    >
                                        {item.status === "upcoming" ? "Sắp diễn ra" : "Đã hoàn thành"}
                                    </Tag>
                                </div>

                                <div style={{ marginTop: 12, marginBottom: 12 }}>
                                    <Space direction="vertical" size={8} style={{ width: "100%" }}>
                                        <div className="election-meta">
                                            <CalendarOutlined className="calendar-icon" />
                                            <Text type="secondary" className="election-date">
                                                Ngày bắt đầu: {item.startDate}
                                            </Text>
                                            {item.endDate && (
                                                <>
                                                    <Text type="secondary" style={{ margin: "0 4px" }}>
                                                        •
                                                    </Text>
                                                    <Text type="secondary" className="election-date">
                                                        Kết thúc: {item.endDate}
                                                    </Text>
                                                </>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                                            <Tag className="role-tag" icon={<UserOutlined />}>
                                                {item.role}
                                            </Tag>
                                            {item.participants && item.totalVoters && (
                                                <Tooltip title={`${item.participants}/${item.totalVoters} người đã tham gia`}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <UserOutlined style={{ color: "#666", fontSize: 14 }} />
                                                        <Text type="secondary" style={{ fontSize: 13 }}>
                                                            {item.participants}/{item.totalVoters} người
                                                        </Text>
                                                    </div>
                                                </Tooltip>
                                            )}
                                        </div>
                                        {item.status === "ongoing" && item.progress !== undefined && (
                                            <div style={{ marginTop: 8 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                                    <Text style={{ fontSize: 12, color: "#666" }}>Tiến độ bầu cử</Text>
                                                    <Text style={{ fontSize: 12, color: "#4caf50", fontWeight: 500 }}>
                                                        {item.progress}%
                                                    </Text>
                                                </div>
                                                <Progress
                                                    percent={item.progress}
                                                    strokeColor={{
                                                        "0%": "#a5d6a7",
                                                        "100%": "#4caf50",
                                                    }}
                                                    showInfo={false}
                                                    size="small"
                                                />
                                            </div>
                                        )}
                                        {item.status === "upcoming" && (
                                            <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(250, 173, 20, 0.1)", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
                                                <FireOutlined style={{ color: "#d48806", fontSize: 14 }} />
                                                <Text style={{ fontSize: 12, color: "#d48806" }}>
                                                    Sắp bắt đầu - Vui lòng chuẩn bị sẵn sàng
                                                </Text>
                                            </div>
                                        )}
                                    </Space>
                                </div>

                                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                                    <Button
                                        type={item.actionType === "green" ? "primary" : "default"}
                                        icon={<EyeOutlined />}
                                        size="small"
                                        style={{
                                            borderRadius: 8,
                                            fontWeight: 500,
                                            ...(item.actionType === "green"
                                                ? {
                                                    background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
                                                    border: "none",
                                                    boxShadow: "0 2px 6px rgba(76, 175, 80, 0.25)",
                                                }
                                                : {
                                                    borderColor: "#a5d6a7",
                                                    color: "#124d2d",
                                                }),
                                        }}
                                    >
                                        {item.actionLabel}
                                    </Button>
                                </div>
                            </div>
                        </List.Item>
                    </motion.div>
                )}
            />
        </Card>
    );
};

export default ElectionList;
