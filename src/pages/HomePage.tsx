import ElectionList, { ElectionItem } from "@/components/homepage/ElectionList";
import HomeHeader from "@/components/homepage/HomeHeader";
import WelcomeCard from "@/components/homepage/WelcomeCard";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { PATH } from "@/enums/PATH";
import { USER_ROLE } from "@/enums/STATUS";
import ElectionParticipantsService from "@/services/ElectionParticipantsService";
import { Col, Layout, Row, Space } from "antd";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bannerContent from "@/assets/banner_content.png";
import "../style/HomePage.model.css";

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
        const electionItems = mapToElectionItems(response.data);
        setDataElection(electionItems);
        setStats(getElectionSummary(response.data, electionItems));
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

  const getElectionSummary = (apiData: any, electionItems?: ElectionItem[]): any => {
    let total = apiData.length;
    let upcoming = 0;
    let ongoing = 0;
    let completed = 0;

    // Nếu có electionItems (đã có meeting status), dùng chúng
    if (electionItems && electionItems.length > 0) {
      electionItems.forEach((item) => {
        if (item.status === "ongoing") {
          ongoing++;
        } else if (item.status === "completed") {
          completed++;
        } else {
          upcoming++;
        }
      });
    } else {
      // Fallback: dùng election status như cũ
      apiData.forEach((item: any) => {
        const election = item.electionId;

        // map status từ API
        if (election?.statusData === "ONGOING") {
          ongoing++;
        } else if (election?.statusData === "COMPLETED") {
          completed++;
        } else {
          upcoming++;
        }
      });
    }

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
      const meetingStatus = item.meetingStatus || "UNDEFINED";
      let status: ElectionItem["status"] = "upcoming";

      // Xác định status dựa trên meeting status từ backend
      if (meetingStatus === "UNDEFINED") {
        status = "undefined";
      } else if (meetingStatus === "ONGOING" || meetingStatus === "ACTIVE") {
        status = "ongoing";
      } else if (meetingStatus === "COMPLETED" || meetingStatus === "CLOSED") {
        status = "completed";
      } else if (meetingStatus === "SCHEDULED" || meetingStatus === "PENDING") {
        status = "upcoming";
      } else {
        // Fallback về election status nếu meetingStatus không khớp
        if (election.status === "ACTIVE" && election.statusData === "ONGOING") {
          status = "ongoing";
        } else if (
          election.status === "ACTIVE" &&
          election.statusData === "COMPLETED"
        ) {
          status = "completed";
        } else {
          status = "upcoming";
        }
      }

      return {
        id: election._id,
        title: election.title,
        startDate: election.startDate || "",
        endDate: election.endDate || undefined,
        status,
        roleCode: item.roleId.roleCode,
        role: item.roleId.roleName || item.position || "",
        actionLabel:
          election.statusData === "WAIT_APPROVAL"
            ? "Chờ phê duyệt"
            : "Xem chi tiết",
        actionType: election.statusData === "WAIT_APPROVAL" ? "blue" : "green",
        participants: undefined,
        progress: undefined,
        totalVoters: undefined,
        permissionElections: item?.permissionElections || [],
        voter: item?.voter || null,
        meetingStatus: meetingStatus,
      };
    });
  };

  return (
    <Layout
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        position: "relative",
      }}
    >
      <HomeHeader />
      <Content
        className="homepage-content"
        style={{
          backgroundImage: `url(${bannerContent})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          position: "relative",
          zIndex: 1,
          minHeight: "calc(100vh - 100px)",
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
