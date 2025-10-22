import { Card, Typography } from "antd";
import "../../../style/voter/Dashboard.model.css";

const { Text } = Typography;

const notifications = [
    {
        icon: "🎉",
        title: "Mở đăng ký bầu cử",
        desc: "Kỳ bầu cử Quốc hội khóa XVI đã mở đăng ký tham gia",
        time: "2 giờ trước",
    },
    {
        icon: "📋",
        title: "Danh sách ứng viên",
        desc: "Danh sách ứng viên chính thức đã được công bố",
        time: "1 ngày trước",
    },
    {
        icon: "⚠️",
        title: "Nhắc nhở quan trọng",
        desc: "Hạn chót đăng ký tham gia là ngày 10/11/2025",
        time: "2 ngày trước",
    },
];

const NotificationPanel = () => (
    <Card
        title={<Text strong style={{ fontSize: 17, paddingLeft: 20 }}>🔔 Thông báo</Text>}
        extra={
            <a style={{ paddingRight: 25 }} href="#" className="notification-view-all">
                Tất cả →
            </a>
        }
        className="notification-card"
    >
        {notifications.map((n, i) => (
            <div key={i} className="notification-item">
                <div className="notification-content">
                    <Text strong className="notification-title">
                        {n.icon} {n.title}
                    </Text>
                    <p className="notification-desc">{n.desc}</p>
                    <p className="notification-time">⏰ {n.time}</p>
                </div>
            </div>
        ))}
    </Card>
);

export default NotificationPanel;
