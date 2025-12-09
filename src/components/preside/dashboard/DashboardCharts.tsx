import { Card, message, Empty } from "antd";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import SystemService from "@/services/StatisticsService";
import { getUserLogin } from "@/utils/auth";
const DashboardCharts = () => {
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();
    const [charts, setCharts] = useState<any[]>([]);
    const [isSystemPreside, setIsSystemPreside] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                // Lấy thông tin user để check chairmanOfTheBoardOfDirectors
                const userData = await getUserLogin();
                const isSystemPresideValue = userData?.chairmanOfTheBoardOfDirectors === true;
                setIsSystemPreside(isSystemPresideValue);

                // Chỉ lấy chart nếu là system preside (vì chart hiển thị nhiều elections)
                if (isSystemPresideValue) {
                    try {
                        const data = await SystemService.getDashboardChart();
                        console.log("Chart data received:", data);
                        // Kiểm tra nếu data là mảng
                        if (Array.isArray(data)) {
                            setCharts(data);
                        } else {
                            console.log("Chart data is not an array:", data);
                            setCharts([]);
                        }
                    } catch (chartError) {
                        console.error("Error fetching chart data:", chartError);
                        setCharts([]);
                    }
                } else {
                    // Nếu không phải system preside, ẩn chart
                    setCharts([]);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                message.error("Không thể tải thông tin người dùng!");
                setCharts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Ẩn chart nếu không phải system preside
    if (!isSystemPreside) {
        return null;
    }

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
                title={<span style={{ paddingLeft: 30 }}>📈 Thống kê tổng số người tham gia trong các cuộc bầu cử gần nhất!</span>}
                style={{
                    flex: 2,
                    borderRadius: '16px'
                }}
            >
                {loading ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                        <span>Đang tải dữ liệu...</span>
                    </div>
                ) : charts.length === 0 ? (
                    <Empty
                        description="Chưa có dữ liệu cuộc bầu cử đã kết thúc"
                        style={{ padding: "40px 0" }}
                    />
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={charts}>
                            <XAxis dataKey="title" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="totalParticipants" name="Tổng số người tham gia" stroke="#22c55e" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </Card>

        </div>
    );
};

export default DashboardCharts;
