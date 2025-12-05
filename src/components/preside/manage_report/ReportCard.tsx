import { Card, Button } from "antd";
import "../../../style/preside/Reports.model.css";

interface ReportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onViewDetail: () => void;
  onExport: () => void;   // NEW
}

const ReportCard: React.FC<ReportCardProps> = ({
  icon,
  title,
  description,
  onViewDetail,
  onExport,
}) => (
  <Card className="report-card">
    <div className="card-content">
      <div className="report-icon">{icon}</div>
      <div className="report-title">{title}</div>
      <div className="report-desc">{description}</div>

      <div style={{ marginTop: "auto" }}>
        <Button
          type="default"
          style={{ width: "100%", marginBottom: 8 }}
          onClick={onViewDetail}
        >
          Chi tiết
        </Button>
      </div>
    </div>
  </Card>
);

export default ReportCard;
