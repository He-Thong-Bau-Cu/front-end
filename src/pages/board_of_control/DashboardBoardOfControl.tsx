import { Col, Row } from "antd";
import {
  LiveMonitor,
  SignatureLog,
  SignatureRequest
} from "../../types/DashBoardBoardOfControl.interface";

import Header from "../../components/board_of_control/dashboard/Header";
import LiveMonitoring from "../../components/board_of_control/dashboard/LiveMonitoring";
import ReportStorage from "../../components/board_of_control/dashboard/ReportStorage";
import SignatureLogs from "../../components/board_of_control/dashboard/SignatureLogs";
import SignatureRequests from "../../components/board_of_control/dashboard/SignatureRequests";
import "../../style/board-of-control/DashBoard.model.css";

export default function DashboardBoardOfControlPage() {

  const requests: SignatureRequest[] = [
    {
      title: "Kết quả cuối cùng: Bầu cử HĐQT 2025",
      time: "11:30 AM - 15/10/2025",
      type: "Kết quả bầu cử",
    },
    {
      title: "Báo cáo kiểm toán hệ thống - Tháng 9",
      time: "09:00 AM - 14/10/2025",
      type: "Báo cáo kiểm soát",
    },
  ];

  const monitor: LiveMonitor = {
    title: "Bầu cử Ban Kiểm soát 2025",
    participationRate: 78,
    totalVotes: 1240,
    remainingTime: "02:15:30",
    isLive: true,
  };

  const logs: SignatureLog[] = [
    {
      content: "Bạn đã ký xác thực 'Kết quả Bầu cử HĐQT 2024'.",
      time: "10:00 AM - 25/12/2024",
    },
    {
      content: "Bạn đã ký xác thực 'Báo cáo kiểm toán Q3/2024'.",
      time: "09:30 AM - 15/10/2024",
    },
  ];

  return (
    <div className="bks-page">
      <Header />

      <Row gutter={[20, 20]} align="top" style={{ paddingTop: 24 }}>
        <Col xs={24} lg={16}>
          <SignatureRequests data={requests} />
          <div style={{ height: 20 }}></div>
          <LiveMonitoring monitor={monitor} />
        </Col>

        <Col xs={24} lg={8}>
          <ReportStorage />
          <div style={{ height: 20 }}></div>
          <SignatureLogs logs={logs} />
        </Col>
      </Row>
    </div>
  );
}
