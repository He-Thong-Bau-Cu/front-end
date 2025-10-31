import { Card, Button, Tag } from "antd";
import { MonitorOutlined } from "@ant-design/icons";
import { LiveMonitor } from "../../../types/DashBoardBoardOfControl.interface";
import "../../../style/board-of-control/DashBoard.model.css"

interface Props {
  monitor: LiveMonitor;
}

export default function LiveMonitoring({ monitor }: Props) {
  return (
    <div className="lm-card">
      {/* ===== HEADER ===== */}
      <div className="lm-header">
        <span className="lm-header-icon">‘A’</span>
        <h3 className="lm-header-title">Giám sát Bầu cử Trực tiếp</h3>
      </div>

      {/* ===== INNER BOX ===== */}
      <div className="lm-inner">
        <div className="lm-top">
          <div className="lm-title">{monitor.title}</div>
          {monitor.isLive && (
            <Tag className="lm-tag-live">TRỰC TIẾP</Tag>
          )}
        </div>

        {/* ===== STATS ===== */}
        <div className="lm-stats">
          <div className="lm-stat-item">
            <div className="lm-stat-label">Tỷ lệ tham gia</div>
            <div className="lm-stat-value">{monitor.participationRate}%</div>
          </div>
          <div className="lm-stat-item">
            <div className="lm-stat-label">Tổng số phiếu</div>
            <div className="lm-stat-value">
              {monitor.totalVotes.toLocaleString()}
            </div>
          </div>
          <div className="lm-stat-item">
            <div className="lm-stat-label">Thời gian còn lại</div>
            <div className="lm-stat-value">{monitor.remainingTime}</div>
          </div>
        </div>

        {/* ===== BUTTON ===== */}
        <button className="lm-btn">
          <MonitorOutlined />
          <span>Vào phòng giám sát chi tiết</span>
        </button>
      </div>
    </div>
  );
}