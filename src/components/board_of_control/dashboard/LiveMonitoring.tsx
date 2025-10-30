import { Card, Button, Tag } from "antd";
import { LiveMonitor } from "../../../types/DashBoardBoardOfControl.interface";

interface Props {
  monitor: LiveMonitor;
}

export default function LiveMonitoring({ monitor }: Props) {
  return (
    <Card className="bks-card">
      <h3 className="bks-section-title">📡 Giám sát Bầu cử Trực tiếp</h3>

      <div className="bks-monitor-box">
        <div className="bks-monitor-info">
          <h4 className="bks-monitor-title">{monitor.title}</h4>
          {monitor.isLive && (
            <Tag color="red" className="bks-tag-live">
              TRỰC TIẾP
            </Tag>
          )}
        </div>

        <div className="bks-monitor-stats">
          <div>
            <span>Tỷ lệ tham gia</span>
            <h3>{monitor.participationRate}%</h3>
          </div>
          <div>
            <span>Tổng số phiếu</span>
            <h3>{monitor.totalVotes}</h3>
          </div>
          <div>
            <span>Thời gian còn lại</span>
            <h3>{monitor.remainingTime}</h3>
          </div>
        </div>

        <Button type="link" className="bks-join-btn">
          🕹️ Vào phòng giám sát chi tiết
        </Button>
      </div>
    </Card>
  );
}
