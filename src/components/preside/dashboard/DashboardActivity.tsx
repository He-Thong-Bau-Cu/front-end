import {
    CheckCircleFilled,
    FileDoneOutlined,
    PlusCircleFilled
} from "@ant-design/icons";
import { Card, Typography } from "antd";

const { Text } = Typography;

const activities = [
    {
        icon: <CheckCircleFilled style={{ color: "#2ecc71" }} />,
        label: "Phê duyệt quyết định triệu tập",
        desc: "Quyết định QĐ-015/2025 về triệu tập bầu cử Quốc hội đã được phê duyệt",
        user: "Ban Tổ chức - Trần Văn B",
        time: "5 phút trước",
    },
    {
        icon: <PlusCircleFilled style={{ color: "#7ecb50" }} />,
        label: "Tạo mới kỳ bầu cử",
        desc: "Kỳ bầu cử HĐND cấp tỉnh 2025 đã được tạo và cấu hình",
        user: "Ban Thư ký - Lý Thị C",
        time: "1 giờ trước",
    },
    {
        icon: <FileDoneOutlined style={{ color: "#3498db" }} />,
        label: "Phê duyệt danh sách ứng viên",
        desc: "145 ứng viên đã được phê duyệt cho kỳ bầu cử Quốc hội",
        user: "Bộ phận Nhân sự - Phạm Văn D",
        time: "2 giờ trước",
    }
];

const DashboardActivity = () => (
    <Card
        title={<Text style={{ paddingLeft: 20, fontSize: 18 }} strong>📋 Hoạt động gần đây</Text>}
        extra={<a href="#" className="decision-list-link">Xem tất cả →</a>}
        className="dashboard-activity-card"
    >
        {activities.map((a, i) => (
            <div key={i} className="dashboard-activity-item">
                <div className="dashboard-activity-content">
                    <Text strong className="dashboard-activity-title">{a.label}</Text>
                    <p className="dashboard-activity-desc">{a.desc}</p>
                    <p className="dashboard-activity-meta">
                        <span className="dashboard-activity-user">{a.user}</span>
                        <span className="dashboard-activity-time">{a.time}</span>
                    </p>
                </div>
            </div>
        ))}
    </Card>
);

export default DashboardActivity;
