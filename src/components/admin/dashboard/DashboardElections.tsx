import { Card, Progress, Tag } from "antd";
import "../../../style/admin/Dashboard.model.css";

const DashboardElections = () => {
    const elections = [
        { title: "Bầu chọn Ban Giám đốc 2024", progress: 68, status: "Đang diễn ra", end: "Còn 2 ngày" },
        { title: "Bình chọn nhân viên xuất sắc Q3", progress: 15, status: "Sắp bắt đầu", end: "Còn 7 ngày" },
        { title: "Bầu chọn đại diện công đoàn", progress: 92, status: "Hoàn thành", end: "Đã kết thúc" },
    ];

    const colorByStatus = (status: string) => {
        switch (status) {
            case "Đang diễn ra": return "green";
            case "Sắp bắt đầu": return "orange";
            case "Hoàn thành": return "blue";
            default: return "gray";
        }
    };

    return (
        <div className="electionWrapper">
            <Card
                title={<span className="electionCardTitle">🗳️ Bầu cử đang diễn ra</span>}
                className="electionCard"
                bodyStyle={{ padding: "20px" }}
            >
                {elections.map((e, i) => (
                    <div key={i} className="electionItem">
                        <div className="electionHeader">
                            <h4 className="electionTitle">{e.title}</h4>
                            <Tag
                                color={colorByStatus(e.status)}
                                className="electionTag"
                            >
                                {e.status}
                            </Tag>
                        </div>

                        <Progress
                            percent={e.progress}
                            showInfo={false}
                            strokeColor="#22c55e"
                            className="electionProgress"
                        />

                        <p className="electionEnd">{e.end}</p>
                    </div>
                ))}
            </Card>
        </div>
    );
};

export default DashboardElections;
