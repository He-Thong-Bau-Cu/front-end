import { Card } from "antd";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const DashboardCharts = () => {
    const lineData = [
        { month: "Th1", rate: 70 },
        { month: "Th2", rate: 74 },
        { month: "Th3", rate: 78 },
        { month: "Th4", rate: 81 },
        { month: "Th5", rate: 87 },
    ];

    const pieData = [
        { name: "Đạt", value: 68 },
        { name: "Chưa đạt", value: 32 },
    ];
    const COLORS = ["#22c55e", "#ef4444"];

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
                title={<span style={{ paddingLeft: 30 }}>📈 Tỷ lệ tham gia theo thời gian</span>}
                style={{
                    flex: 2,
                    borderRadius: '16px'
                }}
            >
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={lineData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={3} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            <Card
                title={<span style={{ paddingLeft: 30 }}>📊 Phân bố kết quả</span>}
                style={{
                    flex: 1,
                    borderRadius: '16px'
                }}
            >
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={90}
                            label
                        >
                            {pieData.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default DashboardCharts;
