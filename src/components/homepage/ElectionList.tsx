import React from "react";
import { Card, List, Tag, Space, Button, Empty, Typography } from "antd";
import { ThunderboltOutlined, CalendarOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface ElectionItem {
    id?: string | number;
    title?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    role?: string;
}

interface ElectionListProps {
    elections: ElectionItem[];
}

const ElectionList: React.FC<ElectionListProps> = ({ elections }) => {
    return (
        <Card
            title={
                <Space>
                    <ThunderboltOutlined style={{ color: "#3ca860" }} />
                    <Text strong style={{ fontSize: 17, color: "#124d2d" }}>
                        Các cuộc bầu cử của bạn
                    </Text>
                </Space>
            }
            style={{
                borderRadius: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                border: "1px solid #e6f4ea",
            }}
            bodyStyle={{ paddingTop: 0 }}
        >
            {elections.length ? (
                <List
                    itemLayout="vertical"
                    dataSource={elections}
                    renderItem={(item) => (
                        <List.Item
                            key={item.id}
                            style={{
                                borderBottom: "1px solid #f0f4f2",
                                paddingBottom: 12,
                                marginBottom: 16,
                            }}
                            actions={[
                                <Button
                                    key="detail"
                                    type="link"
                                    style={{ color: "#2e7d32", fontWeight: 500 }}
                                >
                                    Chi tiết
                                </Button>,
                                <Button
                                    key="action"
                                    type="primary"
                                    style={{
                                        background: "#3ca860",
                                        borderColor: "#3ca860",
                                        borderRadius: 8,
                                        fontWeight: 500,
                                    }}
                                >
                                    Tham gia
                                </Button>,
                            ]}
                        >
                            <List.Item.Meta
                                title={
                                    <Text strong style={{ fontSize: 16, color: "#124d2d" }}>
                                        {item.title}
                                    </Text>
                                }
                                description={
                                    <Space size={12} wrap>
                                        <Tag
                                            color="green"
                                            style={{
                                                background: "#e8f5e9",
                                                borderColor: "#a5d6a7",
                                                color: "#2e7d32",
                                                fontWeight: 500,
                                            }}
                                        >
                                            Vai trò: {item.role?.toUpperCase()}
                                        </Tag>
                                        <Tag
                                            color={
                                                item.status === "active"
                                                    ? "green"
                                                    : item.status === "upcoming"
                                                        ? "orange"
                                                        : "blue"
                                            }
                                            style={{
                                                textTransform: "capitalize",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {item.status}
                                        </Tag>
                                        <Space size={6}>
                                            <CalendarOutlined style={{ color: "#388e3c" }} />
                                            <Text style={{ color: "#333" }}>
                                                {item.startDate} → {item.endDate}
                                            </Text>
                                        </Space>
                                    </Space>
                                }
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <Empty
                    description="Chưa có cuộc bầu cử nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            )}
        </Card>
    );
};

export default ElectionList;
