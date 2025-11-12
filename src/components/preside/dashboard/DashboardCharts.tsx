import { Card, message } from "antd";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import SystemService from "@/services/StatisticsService";
const DashboardCharts = () => {
    const lineData = [
        { month: "Th1", rate: 70 },
        { month: "Th2", rate: 74 },
        { month: "Th3", rate: 78 },
        { month: "Th4", rate: 81 },
        { month: "Th5", rate: 87 },
    ];
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();
    const [charts, setCharts] = useState<any[]>([]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await SystemService.getDashboardChart();
                setCharts(data);
                console.log(charts)
            } catch (error) {
                message.error("Không thể tải thông tin người dùng!");
            }
        };
        fetchUser();
    }, []);

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
                title={<span style={{ paddingLeft: 30 }}>📈 Tỷ lệ tham gia của 5 cuộc bầu cử gần nhất</span>}
                style={{
                    flex: 2,
                    borderRadius: '16px'
                }}
            >
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={charts}>
                        <XAxis dataKey="title" />
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
