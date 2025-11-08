import { Card, Typography } from "antd";
import {
    TeamOutlined,
    BarChartOutlined,
    FileTextOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import "../../../style/voter/Dashboard.model.css";

const { Text } = Typography;

const actions = [
    { icon: <TeamOutlined />, label: "Danh sách ứng viên" },
    { icon: <BarChartOutlined />, label: "Kết quả bầu cử" },
    { icon: <FileTextOutlined />, label: "Lịch sử bỏ phiếu" },
    { icon: <SettingOutlined />, label: "Cài đặt" },
];

const QuickActions = () => (
    <Card title={<Text style={{ paddingLeft: 25, fontSize: 17 }} strong>⚡Thao tác nhanh</Text>} className="">

        <div className="quick-actionquick-actions-cards-grid">
            {actions.map((a, i) => (
                <div key={i} className="quick-action-item">
                    <div className="quick-action-icon">{a.icon}</div>
                    <Text strong className="quick-action-label">
                        {a.label}
                    </Text>
                </div>
            ))}
        </div>
    </Card>
);

export default QuickActions;
