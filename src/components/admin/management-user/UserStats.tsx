import { Card } from "antd";
import {
    UsergroupAddOutlined,
    CheckOutlined,
    CloseOutlined,
    PlusSquareOutlined,
} from "@ant-design/icons";

const UserStats = () => {
    const stats = [
        {
            icon: <UsergroupAddOutlined style={{ fontSize: 36, color: "#1d4dc4" }} />,
            title: "Tổng người dùng",
            value: "1,234",
            change: "+45 tháng này",
            color: "#1d4dc4",
        },
        {
            icon: <CheckOutlined style={{ fontSize: 36, color: "#27AE60" }} />,
            title: "Đang hoạt động",
            value: "1,089",
            change: "+12 hôm nay",
            color: "#27AE60",
        },
        {
            icon: <CloseOutlined style={{ fontSize: 36, color: "#c41d1d" }} />,
            title: "Không hoạt động",
            value: "145",
            change: "-3 tuần này",
            color: "#c41d1d",
        },
        {
            icon: <PlusSquareOutlined style={{ fontSize: 36, color: "#f39c12" }} />,
            title: "Mới tháng này",
            value: "45",
            change: "+15 hôm nay",
            color: "#f39c12",
        },
    ];

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: "24px",
                margin: "20px auto",
                padding: "0 32px",
                boxSizing: "border-box",
                marginBottom: '35px'
            }}
        >
            {stats.map((s, i) => (
                <Card
                    key={i}
                    style={{
                        flex: "1 1 calc(25% - 24px)",
                        minWidth: "250px",
                        height: "160px",
                        border: "1px solid #eee",
                        borderRadius: "16px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                        width: "400px",
                        borderTop: `5px solid ${s.color}`,
                        transition: "transform 0.2s ease",
                    }}
                    bodyStyle={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        padding: "20px 24px",
                    }}
                    hoverable
                >
                    <div
                        style={{
                            height: 90,
                            width: 90,
                            backgroundColor: "#ECF4E9",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "12px",
                        }}
                    >
                        {s.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "38px", fontWeight: 600, margin: "0" }}>
                            {s.value}
                        </p>
                        <p style={{ color: "#666", margin: "0" }}>{s.title}</p>
                        <p
                            style={{
                                color: "#27AE60",
                                fontWeight: "bold",
                                margin: "0",
                                fontSize: "14px",
                            }}
                        >
                            {s.change}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default UserStats;
