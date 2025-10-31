import React from "react";
import { Row, Col } from "antd";
import LiveResult from "../../components/head_of_the_organizing_committee/voting_process/LiveResult";
import LiveVoteFlow from "../../components/head_of_the_organizing_committee/voting_process/LiveVoteFlow";
import CountdownControl from "../../components/head_of_the_organizing_committee/voting_process/CountdownControl";
import SummaryStats from "../../components/head_of_the_organizing_committee/voting_process/SummaryStats";
import {
  Candidate,
  VoteLog,
  SummaryData,
} from "../../types/VottingProcess.interface";
import "../../style/head-of-the-organizing-committee/VotingDashboard.model.css";

export default function VotingProcess() {
  const candidates: Candidate[] = [
    { id: 1, name: "Nguyễn Thị Lan Anh", votes: 45, percent: 40.2 },
    { id: 2, name: "Trần Minh Hoàng", votes: 38, percent: 33.9 },
    { id: 3, name: "Lê Gia Bảo", votes: 29, percent: 25.9 },
  ];

  const voteLogs: VoteLog[] = [
    { id: 1, message: "Một phiếu bầu mới vừa được ghi nhận.", time: "10:35:12 AM" },
    { id: 2, message: "Một phiếu bầu mới vừa được ghi nhận.", time: "10:35:08 AM" },
    { id: 3, message: "Một phiếu bầu mới vừa được ghi nhận.", time: "10:35:01 AM" },
  ];

  const stats: SummaryData = {
    percent: 45,
    voted: 68,
    total: 150,
    validVotes: 112,
    speed: 12,
  };

  return (
    <div className="vd-page">
      <Row gutter={[20, 20]}>
        {/* LEFT */}
        <Col xs={24} lg={16}>
          <LiveResult candidates={candidates} />
          <LiveVoteFlow logs={voteLogs} />
        </Col>

        {/* RIGHT */}
        <Col xs={24} lg={8}>
          <CountdownControl timeLeft="24:15" />
          <SummaryStats stats={stats} />
        </Col>
      </Row>
    </div>
  );
}
