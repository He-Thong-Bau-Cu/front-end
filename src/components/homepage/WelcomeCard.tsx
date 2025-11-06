import React from "react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

interface WelcomeCardProps {
    userName: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName }) => (
    <Card
        style={{
            borderRadius: 16,
            border: "1px solid #e6f2ea",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
    >
        <Title
            level={5}
            style={{
                marginTop: 0,
                color: "#124d2d",
                fontWeight: 600,
            }}
        >
            Xin chào, {userName}! 👋
        </Title>
        <Text style={{ color: "#4e6b55" }}>
            Đây là trang tổng quan bầu cử của bạn. Xem nhanh các cuộc bầu cử đã/đang
            diễn ra và vai trò của bạn trong từng cuộc họp.
        </Text>
    </Card>
);

export default WelcomeCard;
