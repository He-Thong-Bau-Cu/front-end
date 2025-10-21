import { Card } from "antd";
import {
    ThunderboltOutlined,
    UsergroupAddOutlined,
    BarChartOutlined,
    LockOutlined,
    SettingOutlined,
    RiseOutlined,
} from "@ant-design/icons";
import "../../../style/admin/Dashboard.model.css";

const DashboardActivity = () => {
    const activities = [
        { icon: <ThunderboltOutlined style={{ color: "#16a34a", fontSize: 22 }} />, title: "Bầu cử 'Ban Giám đốc 2024' đã đạt 68% tỷ lệ tham gia", time: "15 phút trước" },
        { icon: <UsergroupAddOutlined style={{ color: "#3b82f6", fontSize: 22 }} />, title: "Thêm 25 cử tri mới từ phòng Marketing", time: "1 giờ trước" },
        { icon: <BarChartOutlined style={{ color: "#9b59b6", fontSize: 22 }} />, title: "Xuất báo cáo kết quả bầu cử 'Đại diện công đoàn'", time: "3 giờ trước" },
        { icon: <LockOutlined style={{ color: "#f59e0b", fontSize: 22 }} />, title: "Cập nhật chính sách bảo mật hệ thống", time: "5 giờ trước" },
        { icon: <SettingOutlined style={{ color: "#0ea5e9", fontSize: 22 }} />, title: "Tạo template bầu cử mới cho Q4", time: "1 ngày trước" },
        { icon: <RiseOutlined style={{ color: "#e11d48", fontSize: 22 }} />, title: "Tỷ lệ tham gia tăng 5% so với tháng trước", time: "2 ngày trước" },
    ];

    return (
        <Card
            title={<span className="cardTitle">⚡ Hoạt động gần đây</span>}
            className="cardContainer"
            bodyStyle={{ padding: "20px 24px" }}
        >
            <ul className="activityList">
                {activities.map((a, i) => (
                    <li key={i} className="activityItem">
                        <div className="iconBox">{a.icon}</div>
                        <div className="textContent">
                            <p className="title">{a.title}</p>
                            <p className="time">{a.time}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default DashboardActivity;
