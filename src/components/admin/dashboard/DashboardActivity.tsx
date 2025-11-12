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

export interface Activity {
    title: string;
    time: string;
}

interface DashboardActivityProps {
    activities?: Activity[];
}

const DashboardActivity = ({ activities = [] } : DashboardActivityProps) => {
    return (
        <Card
            title={<span className="cardTitle">⚡ Hoạt động gần đây</span>}
            className="cardContainer"
            bodyStyle={{ padding: "20px 24px" }}
        >
            <ul className="activityList">
                {activities.map((a, i) => (
                    <li key={i} className="activityItem">
                        <div className="iconBox"><ThunderboltOutlined style={{ color: "#16a34a", fontSize: 22 }} /></div>
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
