import { Col, Row } from "antd";

import Header from "../../components/board_of_control/dashboard/Header";
import LiveMonitoring from "../../components/board_of_control/dashboard/LiveMonitoring";
import "../../style/board-of-control/DashBoard.model.css";
import VoterStats from "@/components/board_of_control/dashboard/VoterStats";

export default function DashboardBoardOfControlPage() {


  return (
    <div className="bks-page">
      <div style={{
        marginBottom: 20,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <Header />
      </div>

      <Row gutter={[20, 20]} align="top">
        <Col xs={24}>
          <VoterStats />
        </Col>
        <Col xs={24} >
          <LiveMonitoring />
        </Col>
        {/*
        <Col xs={24} lg={8}>
          <ReportStorage />
          <div style={{ height: 20 }}></div>
          <SignatureLogs logs={logs} />
        </Col> */}
      </Row>
    </div>
  );
}
