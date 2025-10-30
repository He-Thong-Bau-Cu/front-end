import { Card } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import { SignatureLog } from "../../../types/DashBoardBoardOfControl.interface";

interface Props {
  logs: SignatureLog[];
}

export default function SignatureLogs({ logs }: Props) {
  return (
    <Card className="bks-card">
      <h3 className="bks-section-title">
        <HistoryOutlined /> Nhật ký Hoạt động Ký số
      </h3>
      {logs.map((log, i) => (
        <div key={i} className="bks-log-item">
          <div className="bks-log-content">{log.content}</div>
          <div className="bks-log-time">{log.time}</div>
        </div>
      ))}
    </Card>
  );
}
