import { Card, Typography, Progress } from "antd";
import {
  PlayCircleFilled,
  PauseCircleFilled,
  StopFilled,
} from "@ant-design/icons";
import "../../../style/head-of-the-organizing-committee/OrganizerDashboard.model.css";

const { Title, Text } = Typography;

export interface EventProgressData {
  eventTitle: string;
  checkinPercent: number;
  votePercent: number;
  checkinText: string;
  voteText: string;
}

export default function EventProgress({
  eventTitle,
  checkinPercent,
  votePercent,
  checkinText,
  voteText,
}: EventProgressData) {
  return (
    <Card className="elevated event-progress-card" bordered={false}>
      {/* Tiêu đề */}
      <div className="event-progress-header">
        <Title level={5} className="event-progress-title">
          Đang diễn ra: {eventTitle}
        </Title>
      </div>

      {/* Legend (Bắt đầu / Tạm dừng / Kết thúc) */}
      <div className="event-progress-legend">
        <span className="legend-item start">
          <PlayCircleFilled style={{ marginRight: 6 }} />
          Bắt đầu
        </span>
        <span className="legend-item pause">
          <PauseCircleFilled style={{ marginRight: 6 }} />
          Tạm dừng
        </span>
        <span className="legend-item end">
          <StopFilled style={{ marginRight: 6 }} />
          Kết thúc
        </span>
      </div>

      {/* Hai khối song song */}
      <div className="event-progress-grid">
        {/* Check-in */}
        <div className="progress-box">
          <Text className="progress-label">Tiến độ Check-in</Text>
          <Progress
            percent={checkinPercent}
            strokeColor="#52c41a"
            strokeWidth={10}
            showInfo={false}
            className="progress-bar"
          />
          <div className="progress-percent">{checkinPercent}%</div>
          <Text className="progress-foot">{checkinText}</Text>
        </div>

        {/* Bỏ phiếu */}
        <div className="progress-box">
          <Text className="progress-label">Tiến độ Bỏ phiếu</Text>
          <Progress
            percent={votePercent}
            strokeColor="#52c41a"
            strokeWidth={10}
            showInfo={false}
            className="progress-bar"
          />
          <div className="progress-percent">{votePercent}%</div>
          <Text className="progress-foot">{voteText}</Text>
        </div>
      </div>
    </Card>
  );
}
