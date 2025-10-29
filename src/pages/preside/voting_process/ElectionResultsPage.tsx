import React from "react";
import { Row, Col } from "antd";
import ResultStats from "../../../components/preside/voting_process/ResultStats";
import CandidateResults from "../../../components/preside/voting_process/CandidateResults";
import VoteProgressChart from "../../../components/preside/voting_process/VoteProgressChart";
import VoterStatusChart from "../../../components/preside/voting_process/VoterStatusChart";
import DepartmentStats from "../../../components/preside/voting_process/DepartmentStats";
import RecentActivities from "../../../components/preside/voting_process/RecentActivities";
import "../../../style/preside/ElectionResults.model.css";

const ElectionResultsPage = () => {
  const stats = {
    totalVoters: 1250,
    voted: 938,
    notVoted: 312,
    percent: 75.04,
  };

  const candidates = [
    { name: "Nguyễn Thị Lan Anh", votes: 682, percent: 72.7 },
    { name: "Trần Minh Hoàng", votes: 540, percent: 57.6 },
    { name: "Lê Gia Bảo", votes: 415, percent: 44.2 },
    { name: "Phạm Đức Trung", votes: 320, percent: 34.1 },
  ];

  const voteProgress = [
    { time: "09:00", votes: 100 },
    { time: "10:00", votes: 300 },
    { time: "11:00", votes: 500 },
    { time: "12:00", votes: 700 },
    { time: "13:00", votes: 900 },
  ];

  const voterStatus = [
    { name: "Đã bỏ phiếu", value: 938 },
    { name: "Chưa bỏ phiếu", value: 312 },
  ];

  const departmentData = [
    { department: "Kinh doanh", votes: 250 },
    { department: "Kỹ thuật", votes: 220 },
    { department: "Marketing", votes: 200 },
    { department: "Nhân sự", votes: 180 },
    { department: "Kế toán", votes: 150 },
  ];

  const activities = [
    { name: "Nguyễn Văn An", department: "Phòng Kỹ thuật", time: "1 phút trước" },
    { name: "Trần Thị Bích", department: "Phòng Kinh doanh", time: "3 phút trước" },
    { name: "Lê Hoàng Long", department: "Phòng Marketing", time: "5 phút trước" },
    { name: "Phạm Minh Châu", department: "Phòng Nhân sự", time: "8 phút trước" },
  ];

  return (
    <div className="results-container">
      <ResultStats stats={stats} />

      <div className="results-grid" style={{ marginTop: 16 }}>
        <CandidateResults candidates={candidates} />
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <VoteProgressChart data={voteProgress} />
        </Col>
        <Col xs={24} md={12}>
          <VoterStatusChart data={voterStatus} percent={stats.percent} />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <DepartmentStats data={departmentData} />
        </Col>
        <Col xs={24} md={12}>
          <RecentActivities activities={activities} />
        </Col>
      </Row>
    </div>
  );
};

export default ElectionResultsPage;
