import {
    BellOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    UserOutlined
} from "@ant-design/icons";
import { Avatar, Card, Tag, Timeline, Typography } from "antd";
import { motion } from "framer-motion";
import React from "react";

const { Text } = Typography;

const ActivityTimeline: React.FC = () => {
    const activities = [
        {
            id: 1,
            type: "vote",
            title: "Đã bỏ phiếu",
            description: "Bầu cử nghị quyết số 30",
            time: "2 giờ trước",
            icon: <CheckCircleOutlined />,
            color: "#52c41a",
        },
        {
            id: 2,
            type: "document",
            title: "Đã tạo ủy quyền",
            description: "Ủy quyền cho Nguyễn Văn A",
            time: "5 giờ trước",
            icon: <FileTextOutlined />,
            color: "#1677ff",
        },
        {
            id: 3,
            type: "notification",
            title: "Thông báo mới",
            description: "Cuộc bầu cử sắp bắt đầu vào ngày 15/11",
            time: "1 ngày trước",
            icon: <BellOutlined />,
            color: "#d48806",
        },
        {
            id: 4,
            type: "profile",
            title: "Cập nhật hồ sơ",
            description: "Đã cập nhật thông tin cá nhân",
            time: "2 ngày trước",
            icon: <UserOutlined />,
            color: "#722ed1",
        },
        {
            id: 5,
            type: "election",
            title: "Tham gia cuộc bầu cử",
            description: "Bầu cử Phó chủ tịch HĐQT khóa 10",
            time: "3 ngày trước",
            icon: <ClockCircleOutlined />,
            color: "#4caf50",
        },
    ];

    const getActivityDot = (activity: typeof activities[0]) => (
        <Avatar
            size={32}
            style={{
                backgroundColor: `${activity.color}15`,
                border: `2px solid ${activity.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            icon={<span style={{ color: activity.color, fontSize: 16 }}>{activity.icon}</span>}
        />
    );

    return (
        <Card
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
            bodyStyle={{ padding: "24px" }}
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
                    <Text strong style={{ fontSize: 18, color: "#124d2d", letterSpacing: "0.3px" }}>
                        Hoạt động gần đây
                    </Text>
                </div>
            }
        >
            <Timeline
                mode="left"
                items={activities.map((activity, index) => (
                    {
                        dot: (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                            >
                                {getActivityDot(activity)}
                            </motion.div>
                        ),
                        children: (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                style={{
                                    background: "rgba(255, 255, 255, 0.8)",
                                    padding: "12px 16px",
                                    borderRadius: 8,
                                    border: `1px solid ${activity.color}33`,
                                    marginLeft: 8,
                                    transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateX(4px)";
                                    e.currentTarget.style.boxShadow = `0 2px 8px ${activity.color}33`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateX(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                                    <Text strong style={{ fontSize: 14, color: "#124d2d" }}>
                                        {activity.title}
                                    </Text>
                                    <Tag
                                        color={activity.color}
                                        style={{
                                            margin: 0,
                                            borderRadius: 4,
                                            fontSize: 11,
                                            padding: "2px 8px",
                                        }}
                                    >
                                        {activity.time}
                                    </Tag>
                                </div>
                                <Text style={{ fontSize: 13, color: "#666" }}>
                                    {activity.description}
                                </Text>
                            </motion.div>
                        ),
                    }
                ))}
            />
        </Card>
    );
};

export default ActivityTimeline;

