import { Card, Typography } from "antd";
import { UserOutlined, CheckCircleOutlined, AppstoreOutlined, TeamOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const { Text } = Typography;

interface PermissionStatProps {
  data?: any
}

const PermissionStats = ({ data }: PermissionStatProps) => {
  const stats = [
    {
      label: "Tổng quyền hạn",
      value: data.totalPermission,
      bgColor: "#d9f7be",
      iconColor: "#52c41a",
      icon: <UserOutlined style={{ fontSize: "20px" }} />,
    },
    {
      label: "Đang hoạt động",
      value: data.activePermission,
      bgColor: "#d9f7be",
      iconColor: "#52c41a",
      icon: <CheckCircleOutlined style={{ fontSize: "20px" }} />,
    },
    {
      label: "Không hoạt động",
      value: data.inactivePermission,
      bgColor: "#d9f7be",
      iconColor: "#52c41a",
      icon: <ExclamationCircleOutlined style={{ fontSize: "20px" }} />,
    }
  ];

  useEffect(() => {
    stats[0].value = data.totalPermission;
    stats[1].value = data.activePermission;
    stats[2].value = data.inactivePermission;
  }, [data]);

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
