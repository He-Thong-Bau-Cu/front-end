import { Card, Typography } from "antd";
import "../../../style/head-of-the-organizing-committee/OrganizerDashboard.model.css";
const { Text } = Typography;

type StatCardProps = { label: string; value: string | number; highlight?: boolean };

export default function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <Card className={`elevated stat-card ${highlight ? "stat-card--highlight" : ""}`}>
      <Text className="stat-label">{label}</Text>
      <div className="stat-number">{value}</div>
    </Card>
  );
}

