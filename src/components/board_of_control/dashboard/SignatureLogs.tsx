import { Card } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import { SignatureLog } from "../../../types/DashBoardBoardOfControl.interface";
import "../../../style/board-of-control/DashBoard.model.css"

interface Props {
  logs: SignatureLog[];
}

export default function SignatureLogs({ logs }: Props) {
  return (
    <div className="sl-card">
      {/* Header */}
      <div className="sl-header">
        <HistoryOutlined className="sl-header-icon" />
        <h3 className="sl-header-title">Nhật ký Hoạt động Ký số</h3>
      </div>

      {/* List */}
      <div className="sl-list">
        {logs.map((log, index) => (
          <div
            key={index}
            className={`sl-item ${
              index !== logs.length - 1 ? "sl-divider" : ""
            }`}
          >
            <div className="sl-icon">𝒩</div>
            <div className="sl-content">
              <div className="sl-text">{log.content}</div>
              <div className="sl-time">Lúc {log.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}