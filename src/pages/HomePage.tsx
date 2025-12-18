import ElectionList, { ElectionItem } from "@/components/homepage/ElectionList";
import HomeHeader from "@/components/homepage/HomeHeader";
import WelcomeCard from "@/components/homepage/WelcomeCard";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { PATH } from "@/enums/PATH";
import { USER_ROLE } from "@/enums/STATUS";
import ElectionParticipantsService from "@/services/ElectionParticipantsService";
import { Col, Layout, Row, Space, Pagination } from "antd";
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
  const [searchText, setSearchText] = useState<string>("");
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
        const electionItems = mapToElectionItems(response.data).sort(
          (a, b) => {
            const aTime = a.startDate ? new Date(a.startDate).getTime() : 0;
            const bTime = b.startDate ? new Date(b.startDate).getTime() : 0;
            return bTime - aTime; // Mới nhất (ngày lớn hơn) lên đầu
          }
        );
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
    localStorage.setItem(
      "permissionsElections",
      JSON.stringify(election.permissionElections)
    );
    localStorage.setItem("currentElectionId", electionId);
    localStorage.setItem("voterId", election.voter || "");

    switch (election.roleCode) {
      case USER_ROLE.PRESIDE_SECRETARY:
        navigate(PATH.SECRETARY, {
          state: { electionId: electionId, voter: election.voter },
        });
        break;
      case USER_ROLE.ORGANIZING_COMMITTEE_MEMBERS:
        navigate(PATH.ORGANIZING_COMMITTEE, {
          state: { electionId: electionId, voter: election.voter },
        });
        break;
      case USER_ROLE.BOARD_OF_CONTROL:
        navigate(PATH.BOARD_OF_CONTROL, {
          state: { electionId: electionId, voter: election.voter },
        });
        break;
      case USER_ROLE.VOTER:
        navigate(PATH.VOTER, {
          state: { electionId: electionId, voter: election.voter },
        });
        break;
      case USER_ROLE.HEAD_OF_THE_ORGANIZING_COMMITTEE:
        navigate(PATH.HEAD_OF_THE_ORGANIZING_COMMITTEE, {
          state: { electionId: electionId, voter: election.voter },
        });
        break;
      case USER_ROLE.PRESIDE:
        navigate(PATH.PRESIDE, {
          state: { electionId: electionId, voter: election.voter },
        });
        break;
      default:
        break;
    }
  };

  const getElectionSummary = (
    apiData: any,
    electionItems?: ElectionItem[]
  ): any => {
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

      // Nếu election đã được đánh dấu REMAKE hoặc ABNORMAL_REMAKE (bầu cử lại), luôn coi là "đã hoàn thành"
      if (election.statusData === "ABNORMAL_REMAKE") {
        status = "completed";
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

  // Hàm loại bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu
  const removeVietnameseTones = (str: string): string => {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
  };

  const pageSize = 3;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredData = React.useMemo(() => {
    if (!searchText.trim()) return dataElection;
    const keyword = removeVietnameseTones(searchText.trim().toLowerCase());
    return dataElection.filter((item) => {
      const normalizedTitle = removeVietnameseTones(item.title.toLowerCase());
      const normalizedRole = removeVietnameseTones(item.role.toLowerCase());
      return (
        normalizedTitle.includes(keyword) ||
        normalizedRole.includes(keyword)
      );
    });
  }, [dataElection, searchText]);

  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  // reset page khi dữ liệu thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [dataElection, searchText]);

  return (
    <Layout
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        position: "relative",
      }}
    >
      {/* make header fixed so content won't jump under it */}
      <div
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}
      >
        <HomeHeader />
      </div>
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
          // add top padding so content is visible below fixed header
          paddingTop: 100,
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
                  <div style={{ marginTop: 20 }}>
                    <ElectionList
                      data={paginatedData}
                      onSelectElection={handleRedirect}
                      searchText={searchText}
                      onSearchChange={setSearchText}
                    />
                    {/* Pagination */}
                    <div
                      style={{
                        marginTop: 20,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredData.length}
                        onChange={(page) => setCurrentPage(page)}
                        showSizeChanger={false}
                      />
                    </div>
                  </div>
                </motion.div>
              </Space>
            </Col>

            {/* Right Column - Sidebar */}
            <Col xs={24} lg={8}>
              <Space direction="vertical" style={{ width: "100%" }} size={24}>
                <motion.div variants={itemVariants}>
                  <div style={{ marginTop: 20 }}>
                    <WelcomeCard userName={userName} stats={stats} />
                  </div>
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
