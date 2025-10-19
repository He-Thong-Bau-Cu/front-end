import { Card } from "antd";
import {
    ThunderboltOutlined,
    UsergroupAddOutlined,
    BarChartOutlined,
    LockOutlined,
    SettingOutlined,
    RiseOutlined,
} from "@ant-design/icons";

const DashboardActivity = () => {
    const activities = [
        {
            icon: <ThunderboltOutlined style={{ color: "#16a34a", fontSize: 22 }} />,
            title: "Bầu cử 'Ban Giám đốc 2024' đã đạt 68% tỷ lệ tham gia",
            time: "15 phút trước",
        },
        {
            icon: <UsergroupAddOutlined style={{ color: "#3b82f6", fontSize: 22 }} />,
            title: "Thêm 25 cử tri mới từ phòng Marketing",
            time: "1 giờ trước",
        },
        {
            icon: <BarChartOutlined style={{ color: "#9b59b6", fontSize: 22 }} />,
            title: "Xuất báo cáo kết quả bầu cử 'Đại diện công đoàn'",
            time: "3 giờ trước",
        },
        {
            icon: <LockOutlined style={{ color: "#f59e0b", fontSize: 22 }} />,
            title: "Cập nhật chính sách bảo mật hệ thống",
            time: "5 giờ trước",
        },
        {
            icon: <SettingOutlined style={{ color: "#0ea5e9", fontSize: 22 }} />,
            title: "Tạo template bầu cử mới cho Q4",
            time: "1 ngày trước",
        },
        {
            icon: <RiseOutlined style={{ color: "#e11d48", fontSize: 22 }} />,
            title: "Tỷ lệ tham gia tăng 5% so với tháng trước",
            time: "2 ngày trước",
        },
    ];

    return (
        <Card
            title={<span style={{ fontWeight: 600, fontSize: 16 }}>⚡ Hoạt động gần đây</span>}
            style={{
                borderRadius: "16px",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                border: "1px solid #eee",
                flex: 1,
                margin: "15px 32px 0 0",
            }}
            bodyStyle={{ padding: "20px 24px" }}
        >
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {activities.map((a, i) => (
                    <li
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            backgroundColor: "#f9fafb",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            marginBottom: "12px",
                            borderLeft: "4px solid #22c55e",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: "#ecfdf5",
                                borderRadius: "8px",
                                height: 38,
                                width: 38,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: "14px",
                            }}
                        >
                            {a.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 14, color: "#111827", fontWeight: 500 }}>
                                {a.title}
                            </p>
                            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{a.time}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default DashboardActivity;
