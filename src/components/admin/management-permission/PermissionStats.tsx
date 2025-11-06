import { Card, Typography } from "antd";
import { UserOutlined, CheckCircleOutlined, AppstoreOutlined, TeamOutlined, ExclamationCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const PermissionStats = () => {
  const stats = [
    {
      label: "Tổng quyền hạn",
      value: 32,
      bgColor: "#d9f7be",
      iconColor: "#52c41a",
      icon: <UserOutlined style={{ fontSize: "20px" }} />,
    },
    {
      label: "Đã kích hoạt",
      value: 28,
      bgColor: "#d9f7be",
      iconColor: "#52c41a",
      icon: <CheckCircleOutlined style={{ fontSize: "20px" }} />,
    },
    {
      label: "Danh mục",
      value: 6,
      bgColor: "#d9f7be",
      iconColor: "#52c41a",
      icon: <AppstoreOutlined style={{ fontSize: "20px" }} />,
    },
    {
      label: "Vai trò sử dụng",
      value: 4,
      bgColor: "#d9f7be",
      iconColor: "#52c41a",
      icon: <TeamOutlined style={{ fontSize: "20px" }} />,
    },
    {
      label: "Mức độ cao",
      value: 3,
      bgColor: "#fff7e6",
      iconColor: "#faad14",
      icon: <ExclamationCircleOutlined style={{ fontSize: "20px" }} />,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "24px",
        marginBottom: "28px",
        width: "100%",
      }}
    >
      {stats.map((item, index) => (
        <Card
          key={index}
          bordered={false}
          style={{
            borderRadius: "14px",
            textAlign: "center",
            background: "#ffffff",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            padding: "20px 0",
            transition: "transform 0.25s ease, box-shadow 0.25s ease",
          }}
          hoverable
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: item.bgColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: item.iconColor,
              marginBottom: "12px",
            }}
          >
            {item.icon}
          </div>

          <div
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#52c41a",
              marginBottom: "4px",
            }}
          >
            {item.value}
          </div>

          <Text
            style={{
              fontSize: "13px",
              color: "#666",
              fontWeight: "400",
            }}
          >
            {item.label}
          </Text>
        </Card>
      ))}
    </div>
  );
};

export default PermissionStats;
