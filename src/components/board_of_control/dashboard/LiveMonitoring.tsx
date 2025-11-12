import { EyeOutlined, MonitorOutlined } from "@ant-design/icons";
import { Tag } from "antd";
import "../../../style/board-of-control/DashBoard.model.css";
import { useNavigate } from "react-router-dom";

export default function LiveMonitoring() {
  const navigate = useNavigate();

  // ===== DATA TRỰC TIẾP TRONG COMPONENT =====
  const monitor = {
    title: "Đại hội cổ đông 2025",
    isLive: true,
    participationRate: 75,
    totalVotes: 1234,
    validVotes: 1200,
    remainingTime: "01:23:45",
  };

  return (
    <div className="lm-card">
      {/* ===== HEADER ===== */}
      <div className="lm-header">
        <EyeOutlined style={{ marginRight: 4, color: "#3ca860" }} />
        <h3 className="lm-header-title">Giám sát Bầu cử Trực tiếp</h3>
      </div>

      {/* ===== INNER BOX ===== */}
      <div className="lm-inner">
        <div className="lm-top">
          <div className="lm-title">{monitor.title}</div>
          {monitor.isLive && <Tag className="lm-tag-live">TRỰC TIẾP</Tag>}
        </div>

        {/* ===== STATS ===== */}
        <div className="lm-stats">
          <div className="lm-stat-item">
            <div className="lm-stat-label">Tổng số phiếu</div>
            <div className="lm-stat-value">
              {monitor.totalVotes.toLocaleString()}
            </div>
          </div>

          <div className="lm-stat-item">
            <div className="lm-stat-label">Phiếu bầu hợp lệ</div>
            <div className="lm-stat-value">
              {monitor.validVotes.toLocaleString()}
            </div>
          </div>

          <div className="lm-stat-item">
            <div className="lm-stat-label">Thời gian còn lại</div>
            <div className="lm-stat-value">{monitor.remainingTime}</div>
          </div>
        </div>

        {/* ===== BUTTON ===== */}
        <button className="lm-btn" onClick={() => navigate("/board-of-control/voting-process")}>
          <MonitorOutlined />
          <span>Vào phòng giám sát chi tiết</span>
        </button>
      </div>
    </div>
  );
}
