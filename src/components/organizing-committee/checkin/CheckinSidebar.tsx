import { Card, Input, Button, Progress, Typography } from "antd";
import {
    CalendarOutlined,
    BarChartOutlined,
    UserOutlined,
    HistoryOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
} from "@ant-design/icons";

const { Text } = Typography;

const CheckinSidebar: React.FC = () => {
    return (
        <div className="checkin-sidebar">
            {/* Sự kiện */}
            <Card className="checkin-card" >
                <h3 className="sidebar-title-qr">
                    <CalendarOutlined /> Sự kiện
                </h3>
                <p className="sidebar-event-name">Bầu cử Hội đồng Quản trị 2025</p>
                <p className="sidebar-event-time">15/10/2025 | 08:00 AM – 11:00 AM</p>
            </Card>

            {/* Thống kê */}
            <Card className="checkin-card" bordered={false}>
                <h3 className="sidebar-title-qr">
                    <BarChartOutlined /> Thống kê
                </h3>
                <p style={{ marginBottom: 0 }}>Đã check-in</p>
                <Progress percent={65} className="checkin-progress" />
                <p className="sidebar-progress">98 / 150</p>
            </Card>

            {/* Check-in thủ công */}
            <Card className="checkin-card" bordered={false}>
                <h3 className="sidebar-title-qr">
                    <UserOutlined /> Check-in Thủ công
                </h3>
                <Input
                    placeholder="Nhập họ hoặc mã đại biểu..."
                    style={{ marginBottom: 8 }}
                />
                <Button block type="default" className="checkin-btn">
                    Tìm kiếm & Xác nhận
                </Button>
            </Card>

            {/* Hoạt động gần nhất */}
            <Card className="checkin-card" bordered={false}>
                <h3 className="sidebar-title-pr">
                    <HistoryOutlined /> Hoạt động gần nhất
                </h3>
                <div className="checkin-log success">
                    <CheckCircleFilled />
                    <div>
                        <Text strong>Nguyễn Thị Lan Anh</Text>
                        <p>10:31:45 AM</p>
                    </div>
                </div>
                <div className="checkin-log error">
                    <CloseCircleFilled />
                    <div>
                        <Text strong>Check-in thất bại – Mã không hợp lệ</Text>
                        <p>10:15:25 AM</p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CheckinSidebar;
