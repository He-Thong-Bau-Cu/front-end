import React from "react";
import { Card, Button, Input } from "antd";

const AnnouncementCard: React.FC = () => {
    return (
        <Card bordered={false} className="announcement-card">
            <h4 className="announcement-title">Gửi thông báo trực tiếp</h4>

            <Input.TextArea
                placeholder="Nhập thông báo gửi đến tất cả người tham dự..."
                rows={3}
                className="announcement-input"
            />

            <Button type="primary" block className="announcement-button">
                📢 Gửi ngay
            </Button>
        </Card>
    );
};

export default AnnouncementCard;
