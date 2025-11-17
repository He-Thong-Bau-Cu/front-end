import { Card, Typography, Tag } from "antd";
import "../../../style/preside/ElectionResults.model.css";


const { Text } = Typography;

const RecentActivities = ({ activities }: any) => (
  <Card className="chart-card">
    <Text className="chart-title">Hoạt động gần đây</Text>
    {activities.map((a: any, i: any) => (
      <div key={i} className="activity-item">
        <div>
          <Tag color="green" />
          <Text className="activity-name">{a.name}</Text>{" "}
          <Text type="secondary">({a.department}) đã bỏ phiếu.</Text>
        </div>
        <Text className="activity-time">{a.time}</Text>
      </div>
    ))}
  </Card>
);

export default RecentActivities;
