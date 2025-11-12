import { Card, Progress, Tag } from "antd";
import "../../../style/admin/Dashboard.model.css";

export interface Election {
  title: string;
  progress: number;
  status: string;
  end?: string;
}

interface DashboardElectionsProps {
  elections?: Election[];
}

const DashboardElections = ({ elections = [] }: DashboardElectionsProps) => {
  const colorByStatus = (status: string) => {
    switch (status) {
      case "Chờ duyệt":
        return "yellow";
      case "Đã xóa":
        return "red";
      case "Chờ nhập dữ liệu":
        return "gray";
      case "Đang diễn ra":
        return "green";
      case "Sắp bắt đầu":
        return "orange";
      case "Hoàn thành":
        return "blue";
      case "Kết thúc":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="electionWrapper">
      <Card
        title={
          <span className="electionCardTitle">🗳️ Bầu cử đang diễn ra</span>
        }
        className="electionCard"
        bodyStyle={{ padding: "20px " }}
      >
        <div className="electionContent">
          {elections.map((e, i) => (
            <div key={i} className="electionItem">
              <div className="electionHeader">
                <h4 className="electionTitle">{e.title}</h4>
                <Tag color={colorByStatus(e.status)} className="electionTag">
                  {e.status}
                </Tag>
              </div>

              <Progress
                percent={e.progress}
                showInfo={false}
                strokeColor="#22c55e"
                className="electionProgress"
              />

              {/* <p className="electionEnd">{e.end}</p> */}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default DashboardElections;
