import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import BallotService from "@/services/BallotService";
import ElectionService from "@/services/ElectionService";
import { EyeOutlined, MonitorOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../style/board-of-control/DashBoard.model.css";

export default function LiveMonitoring() {
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>("Đang tải...");
  const [totalBallots, setTotalBallots] = useState<number>(0);
  const [castBallots, setCastBallots] = useState<number>(0);

  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const electionId = localStorage.getItem("currentElectionId");



  useEffect(() => {
    const loadData = async () => {
      try {
        if (!electionId) {
          notify("Không tìm thấy electionId!");
          return;
        }

        showLoading();

        const election = await ElectionService.getElectionId(electionId);
        setTitle(election.title);

        const stats = await BallotService.getBallotStatisticsByElectionId(electionId);

        setTotalBallots(stats.total);

        const cast = stats.ballotStatus.find((b) => b._id === "CAST");
        setCastBallots(cast ? cast.totalBallots : 0);

      } catch {
        notify("Không thể tải dữ liệu giám sát bầu cử!");
      } finally {
        hideLoading();
      }
    };

    loadData();
  }, []);




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
          <div className="lm-title">{title}</div>
        </div>

        {/* ===== STATS ===== */}
        <div className="lm-stats">
          <div className="lm-stat-item">
            <div className="lm-stat-label">Tổng số phiếu</div>
            <div className="lm-stat-value">
              {totalBallots}
            </div>
          </div>

          <div className="lm-stat-item">
            <div className="lm-stat-label">Phiếu bầu hợp lệ</div>
            <div className="lm-stat-value">
              {castBallots}
            </div>
          </div>

          <div className="lm-stat-item">
            <div className="lm-stat-label">Phiếu bầu không hợp lệ</div>
            <div className="lm-stat-value">  {totalBallots - castBallots}</div>
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
