import { Card, Button, Tag } from "antd";
import "../../../style/preside/Reports.model.css";

interface ReportCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  type?: string; // thêm type
  onViewDetail: () => void;
  onExport: () => void;
}

const typeLabel: Record<string, string> = {
  AUDIT: "Lưu trữ",
  VERIFICATION: "Xác thực",
  ABNORMAL: "Bất thường",
};

const typeColor: Record<string, string> = {
  AUDIT: "orange",
  VERIFICATION: "blue",
  ABNORMAL: "red",
};

const ReportCard: React.FC<ReportCardProps> = ({
  icon,
  title,
  description,
  type = "PENDING",
  onViewDetail,
  onExport,
}) => (
  <Card className="report-card">
    <div className="card-content">

      {/* ICON TRÁI - TYPE PHẢI */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div className="report-icon">{icon}</div>

        <Tag color={typeColor[type] || "default"}>
          {typeLabel[type] || "Không rõ"}
        </Tag>
      </div>

      <div className="report-title">{title}</div>
      <div className="report-desc">{description}</div>

      <div style={{ marginTop: "auto", marginBottom: 20 }}>
        <Button
          type="default"
          style={{ width: "100%" }}
          onClick={onViewDetail}
        >
          Chi tiết
        </Button>
      </div>

    </div>
  </Card>
);

export default ReportCard;
