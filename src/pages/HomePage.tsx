import ElectionList, { ElectionItem } from "@/components/homepage/ElectionList";
import HomeHeader from "@/components/homepage/HomeHeader";
import QuickActions from "@/components/homepage/QuickActions";
import WelcomeCard from "@/components/homepage/WelcomeCard";
import StatisticsDashboard from "@/components/homepage/StatisticsDashboard";
import CountdownTimer from "@/components/homepage/CountdownTimer";
import ActivityTimeline from "@/components/homepage/ActivityTimeline";
import { Col, Layout, Row, Space } from "antd";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import "../style/HomePage.model.css";
import { useNotification } from "@/contexts/NotificationContext";
import { useLoading } from "@/contexts/LoadingContext";
import ElectionParticipantsService from "@/services/ElectionParticipantsService";
import { USER_ROLE } from "@/enums/STATUS";
import { useNavigate } from "react-router-dom";
import { PATH } from "@/enums/PATH";

const { Content } = Layout;

const HomePage: React.FC = () => {
  const userName = localStorage.getItem("name") || "";
  const [dataElection, setDataElection] = useState<ElectionItem[]>([]);
  const [stats, setStats] = useState<any>({});
  const { notify } = useNotification();
  const { showLoading, hideLoading } = useLoading();
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  useEffect(() => {
    localStorage.removeItem("permissionsElections");
    showLoading();
    fetchData();
    hideLoading();
  }, []);

  const fetchData = async () => {
    try {
      const userId = localStorage.getItem("userId") || "";
      const response = await ElectionParticipantsService.getByUserId(userId);
      if (response.success) {
        setDataElection(mapToElectionItems(response.data));
        setStats(getElectionSummary(response.data));
      } else {
        notify(response.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleRedirect = (electionId: string) => {
    const election = dataElection.find(
      (item) => item.id === electionId
    ) as ElectionItem;
    if (!election) {
      notify("Không tìm thấy cuộc bầu cử", "error");
      return;
    }
    localStorage.setItem("permissionsElections", JSON.stringify(election.permissionElections));
    localStorage.setItem("currentElectionId", electionId);
    localStorage.setItem("voterId", election.voter || "");

    switch (election.roleCode) {
      case USER_ROLE.PRESIDE_SECRETARY:
        navigate(PATH.SECRETARY, { state: { electionId: electionId, voter: election.voter } });
        break;
      case USER_ROLE.ORGANIZING_COMMITTEE_MEMBERS:
        navigate(PATH.ORGANIZING_COMMITTEE, { state: { electionId: electionId, voter: election.voter } });
        break;
      case USER_ROLE.BOARD_OF_CONTROL:
        navigate(PATH.BOARD_OF_CONTROL, { state: { electionId: electionId, voter: election.voter } });
        break;
      case USER_ROLE.VOTER:
        navigate(PATH.VOTER, { state: { electionId: electionId, voter: election.voter } });
        break;
      case USER_ROLE.HEAD_OF_THE_ORGANIZING_COMMITTEE:
        navigate(PATH.HEAD_OF_THE_ORGANIZING_COMMITTEE, { state: { electionId: electionId, voter: election.voter } });
        break;
      default:
        break;
    }
  };

  const getElectionSummary = (apiData: any): any => {
    let total = apiData.length;
    let upcoming = 0;
    let ongoing = 0;
    let completed = 0;

    apiData.forEach((item: any) => {
      const election = item.electionId;

      // map status từ API
      if (election?.statusData === "ONGOING") {
        ongoing++;

      } else if (
        // election?.status === "ACTIVE" &&
        election?.statusData === "COMPLETED"
      ) {
        completed++;
      } else {
        upcoming++;
      }
    });

    return {
      totalElections: total,
      upcomingElections: upcoming,
      ongoingElections: ongoing,
      completedElections: completed,
    };
  };

  const mapToElectionItems = (apiData: any): ElectionItem[] => {
    return apiData.map((item: any) => {
      const election = item.electionId;
      // map status của API sang status của frontend
      let status: ElectionItem["status"] = "upcoming";
      if (election.status === "ACTIVE" && election.statusData === "ONGOING") {
        status = "ongoing";
      } else if (
        election.status === "ACTIVE" &&
        election.statusData === "COMPLETED"
      ) {
        status = "completed";
      }

      return {
        id: election._id,
        title: election.title,
        startDate: election.startDate || "", // default string nếu null
        endDate: election.endDate || undefined,
        status,
        roleCode: item.roleId.roleCode,
        role: item.roleId.roleName || item.position || "",
        actionLabel:
          election.statusData === "WAIT_APPROVAL"
            ? "Chờ phê duyệt"
            : "Xem chi tiết",
        actionType: election.statusData === "WAIT_APPROVAL" ? "blue" : "green",
        participants: undefined, // nếu có dữ liệu từ API bạn fill vào
        progress: undefined, // nếu muốn tính % từ start/endDate
        totalVoters: undefined, // nếu API trả về
        permissionElections: item?.permissionElections || [],
        voter: item?.voter || null,
      };
    });
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 50%, #fafcfb 100%)",
        minWidth: "100vw",
        paddingBottom: "32px",
        position: "relative",
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "40%",
          height: "40%",
          background:
            "radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "30%",
          height: "30%",
          background:
            "radial-gradient(circle, rgba(18, 77, 45, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <HomeHeader />
      <Content
        className="homepage-content"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Main Content Row */}
          <Row gutter={[32, 32]}>
            {/* Left Column - Main Content */}
            <Col xs={24} lg={16}>
              <Space direction="vertical" size={24} style={{ width: "100%" }}>
                <motion.div variants={itemVariants}>
                  <ElectionList data={dataElection} onSelectElection={handleRedirect} />
                </motion.div>
              </Space>
            </Col>

            {/* Right Column - Sidebar */}
            <Col xs={24} lg={8}>
              <Space direction="vertical" style={{ width: "100%" }} size={24}>
                <motion.div variants={itemVariants}>
                  <WelcomeCard userName={userName} stats={stats} />
                </motion.div>
              </Space>
            </Col>
          </Row>
        </motion.div>
      </Content>
    </Layout>
  );
};

export default HomePage;
