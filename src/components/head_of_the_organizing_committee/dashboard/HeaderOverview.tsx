import { Button, Typography } from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import "../../../style/head-of-the-organizing-committee/OrganizerDashboard.model.css";

const { Title, Text } = Typography;

type HeaderOverviewProps = {
  userName: string;
  userNote: string;
  onCreateMeeting?: () => void;
};

export default function HeaderOverview({
  userName, userNote, onCreateMeeting,
}: HeaderOverviewProps) {
  return (
    <div className="header-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <Title level={3} className="header-title">Trưởng ban tổ chức</Title>
          <Text className="header-sub">Trưởng ban tổ chức các cuộc họp</Text>
          <div className="person">
            <div className="person-avatar">LH</div>
            <div>
              <Text strong style={{ color: "#fff" }}>{userName}</Text><br />
              <Text style={{ color: "#f0fff0" }}>{userNote}</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
