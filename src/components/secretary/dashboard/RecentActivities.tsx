import { Card } from "antd";
import {
    PlusCircleOutlined,
    CheckCircleOutlined,
    PlayCircleOutlined,
    UserAddOutlined,
    HistoryOutlined,
} from "@ant-design/icons";
import { JSX } from "react";

interface Activity {
    icon: JSX.Element;
    text: JSX.Element;
    time: string;
}

const activities: Activity[] = [
    {
        icon: <PlusCircleOutlined className="activity-icon green" />,
        text: (
            <>
                Bạn đã tạo <strong>Yêu cầu Ủy quyền UQ-002/2025</strong>.
            </>
        ),
        time: "15 phút trước",
    },
    {
        icon: <CheckCircleOutlined className="activity-icon green" />,
        text: (
            <>
                <strong>President</strong> đã duyệt{" "}
                <strong>Yêu cầu UQ-003/2025</strong>.
            </>
        ),
        time: "1 giờ trước",
    },
    {
        icon: <PlayCircleOutlined className="activity-icon green" />,
        text: (
            <>
                Cuộc bầu cử <strong>HĐQT 2025</strong> đã bắt đầu.
            </>
        ),
        time: "8 giờ trước",
    },
    {
        icon: <UserAddOutlined className="activity-icon green" />,
        text: (
            <>
                Bạn đã thêm <strong>5 cử tri mới</strong> vào hệ thống.
            </>
        ),
        time: "1 ngày trước",
    },
];

const RecentActivities: React.FC = () => {
    return (
        <Card className="activity-card">
            <h3 className="activity-title">
                <HistoryOutlined className="activity-title-icon" /> Hoạt động gần đây
            </h3>

            <div className="activity-list">
                {activities.map((item, index) => (
                    <div key={index} className="activity-item">
                        <div className="activity-left">{item.icon}</div>
                        <div className="activity-right">
                            <p className="activity-text">{item.text}</p>
                            <span className="activity-time">{item.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default RecentActivities;
