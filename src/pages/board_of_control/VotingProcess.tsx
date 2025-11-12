import { Col, Row } from "antd";
import CountdownControl from "../../components/board_of_control/voting_process/CountdownControl";
import LiveResult from "../../components/board_of_control/voting_process/LiveResult";
import SummaryStats from "../../components/board_of_control/voting_process/SummaryStats";
import "../../style/head-of-the-organizing-committee/VotingDashboard.model.css";
import {
  SummaryData
} from "../../types/VottingProcess.interface";

export default function VotingProcess() {

  const stats: SummaryData = {
    percent: 45,
    voted: 68,
    total: 150,
    validVotes: 112,
    speed: 12,
  };

  return (
    <div className="vd-page">

      <Row gutter={[20, 20]} align="stretch">
        <Col xs={24} lg={12} style={{ display: 'flex' }}>
          <CountdownControl timeLeft="24:15" />
        </Col>

        <Col xs={24} lg={12} style={{ display: 'flex' }}>
          <SummaryStats stats={stats} />
        </Col>
      </Row>

      {/* HÀNG DƯỚI */}
      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <LiveResult />

        </Col>
      </Row>

    </div>
  );
}
