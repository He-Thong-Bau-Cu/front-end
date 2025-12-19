import { Card, Progress, Tag } from "antd";

const elections = [
    {
        title: "Bầu cử Hội đồng Quản trị 2025",
        date: "01/11/2025 – 05/11/2025",
        percent: 78,
        status: "Đang hoạt động",
    },
    {
        title: "Bầu cử kiểm soát viên 2025",
        date: "15/11/2025 – 20/11/2025",
        percent: 0,
        status: "Sắp diễn ra",
    },
    {
        title: "Bỏ phiếu Tín nhiệm Giám đốc Vùng",
        date: "16/09/2025 – 20/09/2025",
        percent: 92,
        status: "Đã kết thúc",
    },
];

const ElectionOverview = () => (
    <Card
        title={<span style={{ fontWeight: 600, paddingLeft: 20 }}>🗳️ Tổng quan các Cuộc bầu cử</span>}
        style={{ borderRadius: 16, marginLeft: 32 }}
    >
        {elections.map((e, i) => (
            <div key={i} style={{ marginBottom: 16, backgroundColor: '#F8F9FA', padding: 24, borderRadius: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                        <strong>{e.title}</strong>
                        <p style={{ color: "#777", marginBottom: 4 }}>{e.date}</p>
                        <small style={{ color: "#666" }}>Tỷ lệ tham gia: {e.percent}%</small>
                    </div>
                    <Tag style={{ height: 27, borderRadius: 40 }}
                        color={
                            e.status === "Đang hoạt động"
                                ? "green"
                                : e.status === "Sắp diễn ra"
                                    ? "blue"
                                    : "gray"
                        }
                    >
                        {e.status}
                    </Tag>
                </div>
                <Progress
                    percent={e.percent}
                    showInfo={false}
                    strokeColor="#7ECB50"
                    trailColor="#F0F0F0"
                />
            </div>
        ))}
    </Card>
);

export default ElectionOverview;
