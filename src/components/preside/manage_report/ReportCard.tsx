import { Card, Button, Typography } from "antd";
import "../../../style/preside/Reports.model.css";

const { Text } = Typography;

const ReportCard = ({ icon, title, description }) => (
  <Card className="report-card" bordered={false}>
    <div className="report-icon">{icon}</div>
    <div className="report-title">{title}</div>
    <div className="report-desc">{description}</div>
    <Button className="report-btn">Xuất Báo cáo</Button>
  </Card>
);

export default ReportCard;
