import React, { useState } from "react";
import { Card, Input, Button, message, Modal } from "antd";
import { QrcodeOutlined, SearchOutlined, UserOutlined } from "@ant-design/icons";
import MeetingAttendeeService from "@/services/MeetingAttendeeService";

interface CheckinToolsProps {
    onCheckInSuccess?: () => void;
    meeting?: any;
    election?: any;
}

const CheckinTools: React.FC<CheckinToolsProps> = ({
    onCheckInSuccess,
    meeting,
    election,
}) => {
    const [qrCode, setQrCode] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCheckIn = async () => {
        if (!qrCode.trim()) {
            message.warning("Vui lòng nhập mã QR hoặc ID đại biểu");
            return;
        }

        try {
            setLoading(true);
            const electionId = localStorage.getItem("currentElectionId") || election?._id;

            if (!electionId) {
                message.error("Không tìm thấy thông tin cuộc bầu cử");
                return;
            }

            // Giả sử qrCode chứa userId hoặc có thể tìm kiếm theo username/email
            // Nếu qrCode là userId trực tiếp
            const userId = qrCode.trim();

            const result = await MeetingAttendeeService.checkIn(electionId, userId);

            if (result?.success || result?.data) {
                message.success("Check-in thành công!");
                setQrCode("");
                if (onCheckInSuccess) {
                    onCheckInSuccess();
                }
            } else {
                message.error(result?.message || "Không thể check-in");
            }
        } catch (error: any) {
            console.error("Error checking in:", error);
            message.error(error?.response?.data?.message || "Không thể check-in đại biểu");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            message.warning("Vui lòng nhập thông tin tìm kiếm");
            return;
        }
        // Có thể mở modal tìm kiếm đại biểu ở đây
        message.info("Tính năng tìm kiếm đang được phát triển");
    };

    return (
        <Card
            title="🧰 Công cụ"
            bordered={false}
            className="checkin-tools-card"
        >
            <Input
                placeholder="Nhập mã QR hoặc ID đại biểu..."
                prefix={<QrcodeOutlined style={{ color: "#888" }} />}
                className="checkin-tools-input"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onPressEnter={handleCheckIn}
            />

            <Input
                placeholder="Tìm kiếm Đại biểu..."
                prefix={<SearchOutlined style={{ color: "#888" }} />}
                className="checkin-tools-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onPressEnter={handleSearch}
            />

            <Button
                type="primary"
                block
                className="checkin-tools-btn"
                onClick={handleCheckIn}
                loading={loading}
                icon={<UserOutlined />}
            >
                ✅ Xác nhận Check-in
            </Button>
        </Card>
    );
};

export default CheckinTools;
