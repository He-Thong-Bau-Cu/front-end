import { Card, Progress, Tag } from "antd";

const DashboardElections = () => {
    const elections = [
        { title: "Bầu chọn Ban Giám đốc 2024", progress: 68, status: "Đang diễn ra", end: "Còn 2 ngày" },
        { title: "Bình chọn nhân viên xuất sắc Q3", progress: 15, status: "Sắp bắt đầu", end: "Còn 7 ngày" },
        { title: "Bầu chọn đại diện công đoàn", progress: 92, status: "Hoàn thành", end: "Đã kết thúc" },
    ];

    const colorByStatus = (status) => {
        switch (status) {
            case "Đang diễn ra": return "green";
            case "Sắp bắt đầu": return "orange";
            case "Hoàn thành": return "blue";
            default: return "gray";
        }
    };

    return (
        <div
            style={{
                display: "flex",
                gap: "24px",
                marginBottom: "20px",
                padding: "15px 32px",

            }}
        >
            <Card
                title="🗳️ Bầu cử đang diễn ra"
                style={{
                    flex: 2,
                    borderRadius: "16px",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                    border: "1px solid #eee",

                }}
                bodyStyle={{ padding: "20px" }}
            >
                {elections.map((e, i) => (
                    <div
                        key={i}
                        style={{
                            backgroundColor: "#f8f9fa",
                            borderRadius: "12px",
                            padding: "16px 20px",
                            marginBottom: "16px",
                            boxShadow: "inset 0 0 4px rgba(0,0,0,0.03)",
                            borderLeft: '5px solid #27AE60',

                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "8px",
                            }}
                        >
                            <h4
                                style={{
                                    fontWeight: 600,
                                    fontSize: "16px",
                                    margin: 0,
                                    color: "#333",
                                }}
                            >
                                {e.title}
                            </h4>
                            <Tag
                                color={colorByStatus(e.status)}
                                style={{
                                    fontWeight: 500,
                                    fontSize: "13px",
                                    borderRadius: "8px",
                                    padding: "2px 8px",
                                }}
                            >
                                {e.status}
                            </Tag>
                        </div>

                        <Progress
                            percent={e.progress}
                            showInfo={false}
                            strokeColor="#22c55e"
                            style={{ marginBottom: "6px" }}
                        />

                        <p
                            style={{
                                fontSize: "13px",
                                color: "#777",
                                margin: 0,
                            }}
                        >
                            {e.end}
                        </p>
                    </div>
                ))}
            </Card>
        </div>
    );
};

export default DashboardElections;
