import { CalendarOutlined } from "@ant-design/icons";
import { Card, List, Tag, Typography } from "antd";
import React from "react";

const { Text } = Typography;

interface ElectionItem {
    id: string | number;
    title: string;
    startDate: string;
    status: "upcoming" | "completed";
    role: string;
    actionLabel: string;
    actionType: "green" | "blue";
}

const ElectionList: React.FC = () => {
    const elections: ElectionItem[] = [
        {
            id: 1,
            title: "Bầu cử nghị quyết số 30",
            startDate: "15/11/2025",
            status: "upcoming",
            role: "Chủ tọa",
            actionLabel: "Xem nghị quyết",
            actionType: "green",
        },
        {
            id: 2,
            title: "Bầu cử Phó chủ tịch hội đồng quản trị khóa 10",
            startDate: "20/11/2025",
            status: "upcoming",
            role: "Đại biểu",
            actionLabel: "Xem ứng viên",
            actionType: "green",
        },
        {
            id: 3,
            title: "Bầu cử bãi nhiệm tổng giám đốc",
            startDate: "25/08/2025",
            status: "completed",
            role: "Quan sát viên",
            actionLabel: "Xem kết quả",
            actionType: "blue",
        },
        {
            id: 4,
            title: "Bầu cử tăng vốn đầu tư",
            startDate: "10/05/2025",
            status: "completed",
            role: "Thành viên HĐQT",
            actionLabel: "Xem kết quả",
            actionType: "blue",
        },
    ];

    return (
        <Card
            title={
                <Text strong className="election-title">
                    Các kỳ bầu cử
                </Text>
            }
            extra={
                <Text className="view-all">Xem tất cả →</Text>
            }
            className="election-card"
        >
            <List
                dataSource={elections}
                renderItem={(item) => (
                    <List.Item className="election-item">
                        <div className="election-header">
                            <Text strong className="election-item-title">
                                {item.title}
                            </Text>
                            <Tag
                                className={`status-tag ${item.status === "upcoming" ? "tag-upcoming" : "tag-completed"
                                    }`}
                            >
                                {item.status === "upcoming" ? "Sắp diễn ra" : "Đã hoàn thành"}
                            </Tag>
                        </div>

                        <div className="election-meta">
                            <CalendarOutlined className="calendar-icon" />
                            <Text type="secondary" className="election-date">
                                Ngày bầu cử: {item.startDate}
                            </Text>
                        </div>
                        <Tag className="role-tag">Vai trò: {item.role}</Tag>

                    </List.Item>
                )}
            />
        </Card>
    );
};

export default ElectionList;
