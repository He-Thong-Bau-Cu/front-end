import { Card, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import "../../../style/head-of-the-organizing-committee/OrganizerDashboard.model.css";

const { Title, Text } = Typography;

type Upcoming = {
  id: string;
  name: string;
  time: string;   // vd: "Bắt đầu: 10:00 - 15/11/2025"
  status: string; // vd: "Chưa bắt đầu"
  linkText: string; // "Chuẩn bị"
};
type Props = { events: Upcoming[] };

export default function UpcomingEvents({ events }: Props) {
  return (
    <Card className="elevated upcoming-card" bordered={false}>
      <div className="up-head">
        <Title level={5} className="block-title up-title">
          <CalendarOutlined style={{ marginRight: 8 }} />
          Sự kiện Sắp diễn ra
        </Title>
      </div>

      {events.map((ev) => (
        <div key={ev.id} className="up-row">
          <Text strong className="up-name">{ev.name}</Text>
          <Text className="up-time">{ev.time}</Text>
          <div className="up-actions">
            <span className="status-warn">{ev.status}</span>
            <a className="up-link">{ev.linkText}</a>
          </div>
        </div>
      ))}
    </Card>
  );
}
