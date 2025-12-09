import {
  Card,
  Input,
  Button,
  Select,
  Table,
  Tag,
  Space,
  message,
  Spin,
  Modal,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import type { Decision } from "@/types/Decision.interface";
import CreateDecisionModal from "@/components/preside/management-decision/CreateDecisionModal";
import ViewDecisionModal from "@/components/preside/management-decision/ViewDecisionModal";
import DecisionService from "@/services/DecisionService";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ElectionParticipantsService from "@/services/ElectionParticipantsService";
import ElectionDocumentService from "@/services/ElectionDocumentService";
import ElectionEntitiesService from "@/services/ElectionEntitiesService";
import MeetingService from "@/services/MeetingService";
import ResultService from "@/services/ResultService";
import ViewDecisionResultModal from "./ViewDecisionResultModal";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import DigitalSignModal from "@/pages/digitalSignature/DigitalSignModal";
import FileService from "@/services/FileService";
import VotingRightService from "@/services/VotingRightService";
import { getUserLogin } from "@/utils/auth";
const { Option } = Select;
const { confirm } = Modal;
// Hàm format ngày chỉ hiển thị ngày/tháng/năm
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return "";
  }
};

// Map status từ English sang tiếng Việt
const statusMap: { [key: string]: string } = {
  "APPROVED_SIGNED": "Đã phê duyệt",
  "WAIT_APPROVAL": "Chờ duyệt",
  "REJECTED": "Từ chối",
  "WAIT_ENTER_DATA": "Chờ nhập dữ liệu",
  "DRAFT": "Lưu nháp"
};
const DecisionTable = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [documents, setDocument] = useState<any[]>([]);
  const [voters, setVoters] = useState<any[]>([]);
  const [organize, setOrganize] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDecisionData, setViewDecisionData] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [data, setData] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [meeting, setMeeting] = useState<any | null>(null);
  const [openResultModal, setOpenResultModal] = useState(false);
  const [resultData, setResultData] = useState<any[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const [recordId, setRecordId] = useState<string>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [secretary, setSecrytary] = useState<any | null>(null);
  const { notify } = useNotification();
  const [isSystemPreside, setIsSystemPreside] = useState(true);
  const [currentElectionId, setCurrentElectionId] = useState<string | undefined>(undefined);
  const [userFetched, setUserFetched] = useState(false);

  // Lấy thông tin user và electionId
  useEffect(() => {
    const fetchUserAndElectionId = async () => {
      try {
        // Clear data trước khi fetch user để tránh hiển thị data sai
        setData([]);

        const userData = await getUserLogin();
        const isSystemPresideValue = userData?.chairmanOfTheBoardOfDirectors === true;
        setIsSystemPreside(isSystemPresideValue);

        // Nếu không phải system preside, lấy electionId từ localStorage
        if (!isSystemPresideValue) {
          const electionId = localStorage.getItem("currentElectionId") || undefined;
          setCurrentElectionId(electionId);
        } else {
          setCurrentElectionId(undefined);
        }
        setUserFetched(true);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUserFetched(true);
      }
    };
    fetchUserAndElectionId();
  }, []);

  useEffect(() => {
    // Chỉ load khi đã fetch user xong
    if (!userFetched) return;
    loadDecisions(1, pagination.pageSize);
  }, [statusFilter, searchText, currentElectionId, userFetched, isSystemPreside]);

  useEffect(() => {
    if (searchText === "" && statusFilter === "") {
      return;
    }
    const timer = setTimeout(() => {
      loadDecisions(1, pagination.pageSize); // Reset về trang 1 khi search thay đổi
    }, 500); // Debounce 500ms cho search text

    return () => clearTimeout(timer);
  }, [searchText]);

  const loadDecisions = async (page: number = 1, limit: number = 10) => {
    // Chỉ load khi đã fetch user xong
    if (!userFetched) return;

    setLoading(true);
    try {
      const response = await DecisionService.getAllDecisions({
        page,
        limit,
        textSearch: searchText.trim() || undefined,
        statusData: statusFilter || undefined,
        // Nếu không phải system preside, chỉ lấy election hiện tại
        electionId: !isSystemPreside ? currentElectionId : undefined,
      });
      setData(response?.content || []);
      setPagination({
        current: response.page || page,
        pageSize: response.limit || limit,
        total: response.totalItems || 0,
      });
    } catch (err: any) {
      notify(err.response?.data?.message, "error");
    } finally {
      hideLoading();
    }
  };

  const handleViewResult = async (record: any) => {
    try {
      const res = await ResultService.getResultByElectionId(record._id); // API lấy kết quả
      setResultData(res);
      setOpenResultModal(true);
    } catch (err: any) {
      notify(err.response?.data?.message, "error");
    }
  };
  const handleCreateDecision = async (values: any, isEdit?: boolean, id?: string) => {
    try {
      showLoading();
      let response;
      let secretary;
      if (isEdit && id) {
        const apiData: any = {
          decisionNumber: values.decisionNumber,
          decisionName: values.decisionName,
          title: values.decisionName,
          statusData: values.statusData,
          startDate: values.startDate,
          endDate: values.endDate
        };
        response = await DecisionService.updateDecision(id, apiData);
        if (response.status === 200 && response.success) {
          setOpen(false);
          notify(response.message, "success");
        } else {
          notify(response.message, "error");
        }
      } else {
        const apiData2: any = {
          decisionNumber: values.decisionNumber,
          decisionName: values.decisionName,
          title: values.decisionName,
          statusData: values.statusData,
          startDate: values.startDate,
          endDate: values.endDate
        };
        response = await DecisionService.createDecision(apiData2);
        if (response.success) {
          setOpen(false);
          notify(response.message, "success");
        } else {
          notify(response.message, "error");
        }
        const apiData3: any = {
          electionId: response.data?._id,
          userId: values.secretaryId,
          roleId: "6904d5f7105b6a336b819be5",
          position: "Thư ký chủ tọa",
          status: "ACTIVE"
        };
        secretary = await ElectionParticipantsService.createParticipant(apiData3);
      }
      setOpen(false);
      setEditMode(false);
      setEditingDecision(null);
      await loadDecisions(pagination.current, pagination.pageSize);
    } catch (err: any) {
      notify(err.response?.data?.message, "error");
    } finally {
      hideLoading();
    }
  };



  const handleViewDecision = async (record: string) => {
    try {
      setViewLoading(true);
      setViewModalOpen(true);
      const data1 = await ElectionDocumentService.getDocumentByElectionId(record);
      const filteredData = data1.filter((item: any) => item.type !== "voter-signed-ballots");
      setDocument(filteredData);
      const data3 = await ElectionEntitiesService.getElectionEntitiesByElectionId(record);
      setEntities(data3);
      const data4 = await ElectionParticipantsService.getByElectionId(record);
      const roleId1List: any = data4.filter((p: any) => p.roleId.roleCode === "VOTER");
      const otherRolesList: any = data4.filter((p: any) => p.roleId.roleCode !== "VOTER");
      setOrganize(otherRolesList ? otherRolesList : []);
      const data5 = await MeetingService.getByElectionId(record);
      setMeeting(data5.data[0] ? data5.data[0] : null);
      const v = await VotingRightService.getVotingRightByElectionId(record);
      roleId1List.forEach((voter: any) => {
        const votingRight = v.find(
          (vr: any) => vr.voterId.userId === voter.userId
        );
        if (votingRight) {
          voter.percent = votingRight.shares;
          voter.statusVoter = votingRight.voterId.status;   // <-- Thêm dòng này
        } else {
          voter.percent = 0;
          voter.statusVoter = "INACTIVE";                    // <-- hoặc null tuỳ ý bạn
        }
      });
      setVoters(roleId1List);
      // Gọi API để lấy chi tiết decision
      const decisionDetail = await DecisionService.getElectionById(record);

      setViewDecisionData(decisionDetail.data);
    } catch (err: any) {
      notify(err.response?.data?.message, "error");
      setViewModalOpen(false);
      setViewDecisionData(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditDecision = async (record: Decision) => {
    try {
      setEditLoading(true);
      setEditMode(true);
      const decisionDetail = await DecisionService.getElectionById(record._id);
      const secrytary = await ElectionParticipantsService.getByElectionId(record._id);
      for (const a of secrytary) {
        if (a.roleId?._id === "6904d5f7105b6a336b819be5") {
          setSecrytary(a); 
          break;
        }
      }
      setEditingDecision(decisionDetail.data);
      setOpen(true);
    } catch (err: any) {
      notify(err.response?.data?.message, "error");
    } finally {
      setEditLoading(false);
    }
  };

  const handleView = async (id: string) => {
    setRecordId(id)
  }

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    loadDecisions(current, pageSize); // ✅ luôn gọi API với statusFilter hiện tại
  };
  // Định nghĩa columns bên trong component để có thể sử dụng các hàm xử lý
  const columns = [
    {
      title: "STT",
      width: 70,
      align: "center" as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "SỐ QUYẾT ĐỊNH",
      decision_number: "SỐ QUYẾT ĐỊNH",
      decision_name: "TÊN QUYẾT ĐỊNH",
      render: (record: Decision) => (
        <>
          <a>{record.decisionNumber}</a>

        </>
      ),
    },
    { title: "TÊN QUYẾT ĐỊNH", dataIndex: "decisionName" },
    {
      title: "TRẠNG THÁI",
      dataIndex: "statusData", render: (statusData: string) => {
        const color =
          statusData === "APPROVED_SIGNED"
            ? "green"
            : statusData === "WAIT_ENTER_DATA"
              ? "orange"
              : statusData === "WAIT_APPROVAL"
                ? "yellow"
                : statusData === "REJECTED"
                  ? "pink"
                  : statusData === "DRAFT"
                    ? "red"
                    : "gray";
        return <Tag
          style={{ padding: 8}}
          color={color}>{statusMap[statusData] || statusData || "Chờ duyệt"}</Tag>;
      },
    },
    {
      title: "NGÀY TẠO",
      dataIndex: "createdAt",
      render: (date: Date | string) => formatDate(date) || "-"
    },
    {
      title: "THAO TÁC",
      render: (_: any, record: Decision) => (
        <Space>
          {record.statusData === "WAIT_APPROVAL" ? (
            <Tag
              color={"yellow"}
              style={{ padding: 8, cursor: "pointer", border: "1px solid " }}
              icon={<EyeOutlined />}
              onClick={() => {
                handleViewDecision(record._id)
                handleView(record._id);
              }

              }>
              Xem và ký số
            </Tag>
          ) : (
            <Tag
              color={"blue"}
              style={{ padding: 8, cursor: "pointer", border: "1px solid " }}
              icon={<EyeOutlined />}
              onClick={() => {
                handleViewDecision(record._id)
                handleView(record._id);
              }

              }>
              Xem chi tiết
            </Tag>
          )}

          {record.statusData === "DRAFT" && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditDecision(record)}
            />
          )}

          {
            record.status === "CLOSED" && (
              <Button
                size="small"
                icon={<EyeOutlined />}
                style={{ color: "green" }}
                onClick={() => handleViewResult(record)}
              >
                Xem kết quả
              </Button>
            )
          }
        </Space>
      ),
    },
  ];
  return (
    <Card className="decision-table-card" style={{ padding: '20px' }}>
      <div className="decision-toolbar">
        <Input
          placeholder="Tìm kiếm theo tên quyết định..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="decision-toolbar-actions">
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value); // ✅ Khi đổi, useEffect sẽ gọi lại API
              setPagination({ current: 1, pageSize: pagination.pageSize, total: pagination.total });
            }}
            style={{ width: 180 }}
          >
            <Option value="">Tất cả trạng thái</Option>
            <Option value="APPROVED_SIGNED">Đã phê duyệt</Option>
            <Option value="WAIT_ENTER_DATA">Chờ nhập dữ liệu</Option>
            <Option value="WAIT_APPROVAL">Chờ duyệt</Option>
            <Option value="REJECTED">Yêu cầu chỉnh sửa</Option>
            <Option value="DRAFT">Lưu nháp</Option>
          </Select>
          {isSystemPreside && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="btn-create"
              onClick={() => {
                setEditMode(false);
                setEditingDecision(null);
                setOpen(true);
              }}
            >
              Tạo quyết định mới
            </Button>
          )}
        </div>
      </div>

      <Spin spinning={loading}>
        {data.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Không có dữ liệu quyết định nào</p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} nghị quyết`,
            }}
            onChange={handleTableChange} // ✅ Table gửi object pagination đúng định dạng
          />

        )}
      </Spin>
      {/* 🧩 Modal tạo/chỉnh sửa nghị quyết */}
      <CreateDecisionModal
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditMode(false);
          setEditingDecision(null);
        }}
        onSubmit={handleCreateDecision}
        editMode={editMode}
        initialData={editingDecision}
        secrytary={secretary}
      />

      {/* 🧩 Modal xem chi tiết quyết định */}
      <ViewDecisionModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewDecisionData(null);
          setRecordId("");
        }}
        onSign={() => {
          loadDecisions(pagination.current, pagination.pageSize);
          handleViewDecision(recordId)
        }}
        data={viewDecisionData}
        loading={viewLoading}
        voters={voters}
        organize={organize}
        documents={documents}
        electionentities={entities}
        meeting={meeting}
      />

      <ViewDecisionResultModal
        open={openResultModal}
        onClose={() => setOpenResultModal(false)}
        data={resultData}
      />
      {/* <ConfirmDeleteModal
        open={openConfirm}
        onCancel={() => setOpenConfirm(false)}
        onConfirm={async () => {
          if (!selectedRecord?._id) return;
          try {
            setLoading(true);
            const re = await DecisionService.updateDecision(selectedRecord._id, { statusData: "DELETE", status: "DELETED" });
            if (re.status === 200 && re.success) {
              notify(re.message, "success");
              message.success("Xóa nghị quyết thành công!");
            } else {
              notify(re.message, "error");
              message.error("Không thể xóa nghị quyết. Vui lòng thử lại.");
            }
            await loadDecisions(pagination.current, pagination.pageSize);
          } catch (error) {
            notify("Không thể xóa nghị quyết. Vui lòng thử lại.", "error");
            message.error("Không thể xóa nghị quyết. Vui lòng thử lại.");
          } finally {
            setOpenConfirm(false);
            setLoading(false);
          }
        }}
      /> */}

    </Card>
  );
};

export default DecisionTable;
