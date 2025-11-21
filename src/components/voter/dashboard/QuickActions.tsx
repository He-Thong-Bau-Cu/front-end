import {
    BarChartOutlined,
    FileTextOutlined
} from "@ant-design/icons";
import { Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import "../../../style/voter/Dashboard.model.css";

const { Text } = Typography;

const actions = [
    // { icon: <TeamOutlined />, label: "Chi tiết bầu cử", path: "/voter/candidates" },
    { icon: <BarChartOutlined />, label: "Kết quả bầu cử", path: "/voter/results" },
    { icon: <FileTextOutlined />, label: "Lịch sử bỏ phiếu", path: "/voter/voting-history" },
    // { icon: <SettingOutlined />, label: "Cài đặt", path: "/voter/settings" },
];

const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <Card
            title={
                <Text style={{ paddingLeft: 25, fontSize: 17 }} strong>
                    ⚡ Thao tác nhanh
                </Text>
            }
            className="quick-actions-card"
        >
            <div className="quick-actions-grid">
                {actions.map((a, i) => (
                    <div
                        key={i}
                        className="quick-action-item"
                        onClick={() => navigate(a.path)}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="quick-action-icon">{a.icon}</div>
                        <Text strong className="quick-action-label">
                            {a.label}
                        </Text>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default QuickActions;
