import React, { useState } from "react";
import { Card, Button, Input, message } from "antd";
import { NotificationOutlined } from "@ant-design/icons";
import NotificationService from "@/services/NotificationService";

interface AnnouncementCardProps {
    electionId?: string;
    meeting?: any;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ electionId, meeting }) => {
    const [announcementText, setAnnouncementText] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendAnnouncement = async () => {
        if (!announcementText.trim()) {
            message.warning("Vui lòng nhập nội dung thông báo");
            return;
        }

        if (!electionId) {
            message.error("Không tìm thấy thông tin cuộc bầu cử");
            return;
        }

        try {
            setLoading(true);
            const response = await NotificationService.broadcastAnnouncement(electionId, announcementText);
            message.success(response?.data?.message || "Gửi thông báo thành công");
            setAnnouncementText("");
        } catch (error: any) {
            console.error("Error sending announcement:", error);
            message.error(error?.response?.data?.message || "Không thể gửi thông báo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card bordered={false} className="announcement-card">
            <h4 className="announcement-title">Gửi thông báo trực tiếp</h4>

            <Input.TextArea
                placeholder="Nhập thông báo gửi đến tất cả người tham dự..."
                rows={3}
                className="announcement-input"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
            />

            <Button
                type="primary"
                block
                className="announcement-button"
                onClick={handleSendAnnouncement}
                loading={loading}
                icon={<NotificationOutlined />}
            >
                Gửi ngay
            </Button>
        </Card>
    );
};

export default AnnouncementCard;
