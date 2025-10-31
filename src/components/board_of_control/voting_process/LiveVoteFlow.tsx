import { Card, Row, Col, Typography } from "antd";
import { VoteLog } from "../../../types/VottingProcess.interface";

const { Text } = Typography;

export default function LiveVoteFlow({ logs }: { logs: VoteLog[] }) {
  return (
    <Card className="vd-card vd-log-card" bordered={false}>
      <Text className="vd-section-title">Luồng Bỏ phiếu Trực tiếp</Text>
      <div className="vd-log-container">
        {logs.map((log) => (
          <div key={log.id} className="vd-log-row">
            <Text className="vd-log-message">{log.message}</Text>
            <Text type="secondary" className="vd-log-time">
              {log.time}
            </Text>
          </div>
        ))}
      </div>
    </Card>
  );
}