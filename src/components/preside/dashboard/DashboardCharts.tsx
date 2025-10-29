import { Card } from "antd";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const DashboardCharts = () => {
    const lineData = [
        { month: "Th1", rate: 70 },
        { month: "Th2", rate: 74 },
        { month: "Th3", rate: 78 },
        { month: "Th4", rate: 81 },
        { month: "Th5", rate: 87 },
    ];



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

        </div>
    );
};

export default DashboardCharts;
