import { Card, Typography } from "antd";
import { SummaryData } from "../../../types/VottingProcess.interface";

const { Text } = Typography;

export default function SummaryStats({ stats }: { stats: SummaryData }) {
  return (
    <Card className="vd-card vd-summary-card" bordered={false}>
      <Text className="vd-section-title">Thống kê Tổng quan</Text>

      <div className="vd-summary-percent">{stats.percent}%</div>
      <div className="vd-summary-sub">{stats.voted} / {stats.total} Cử tri</div>

      <div className="vd-summary-grid">
        <div className="vd-summary-item">
          <Text type="secondary">Đã bỏ phiếu</Text>
          <div className="vd-summary-value">{stats.voted}</div>
        </div>
        <div className="vd-summary-item">
          <Text type="secondary">Chưa bỏ phiếu</Text>
          <div className="vd-summary-value">{stats.total - stats.voted}</div>
        </div>
        <div className="vd-summary-item">
          <Text type="secondary">Phiếu hợp lệ</Text>
          <div className="vd-summary-value">{stats.validVotes}</div>
        </div>
        <div className="vd-summary-item">
          <Text type="secondary">Tốc độ</Text>
          <div className="vd-summary-value">~{stats.speed}/phút</div>
        </div>
      </div>
    </Card>
  );
}