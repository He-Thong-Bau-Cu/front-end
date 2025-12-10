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
import type { Decision } from "@/types/Decision.interface";
import CreateDecisionModal from "@/components/preside/management-decision/CreateDecisionModal";
import ViewDecisionModal from "@/components/preside/management-decision/ViewDecisionModal";
import DecisionService from "@/services/DecisionService";
import ElectionParticipantsService from "@/services/ElectionParticipantsService";
import ElectionDocumentService from "@/services/ElectionDocumentService";
import ElectionEntitiesService from "@/services/ElectionEntitiesService";
import MeetingService from "@/services/MeetingService";
import ResultService from "@/services/ResultService";
import ViewDecisionResultModal from "./ViewDecisionResultModal";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import VotingRightService from "@/services/VotingRightService";
import ElectionService from "@/services/ElectionService";
const { Option } = Select;
const { confirm } = Modal;
// Hàm format ngày chỉ hiển thị ngày/tháng/năm
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// Map status từ English sang tiếng Việt
const statusMap: { [key: string]: string } = {
  APPROVED_SIGNED: "Đã phê duyệt",
  WAIT_APPROVAL: "Chờ duyệt",
  WAIT_BKS_CONFIRMED: "Chờ Ban Kiểm Soát xác nhận",
  REJECTED: "Từ chối",
  WAIT_ENTER_DATA: "Chờ nhập dữ liệu",
  DRAFT: "Lưu nháp",
};
const DecisionTable = () => {
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
  useEffect(() => {
    loadDecisions(1, pagination.pageSize);
  }, [statusFilter, searchText]);

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
    showLoading();
    try {
      const response = await DecisionService.getAllDecisions({
        page,
        limit,
        textSearch: searchText.trim() || undefined,
        statusData: statusFilter || undefined,
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
  const handleCreateDecision = async (
    values: any,
    isEdit?: boolean,
    id?: string
  ) => {
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
          endDate: values.endDate,
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
          endDate: values.endDate,
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
          status: "ACTIVE",
        };
        secretary =
          await ElectionParticipantsService.createParticipant(apiData3);
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
      const data1 =
        await ElectionDocumentService.getDocumentByElectionId(record);
      const filteredData = data1.filter(
        (item: any) => item.type !== "voter-signed-ballots"
      );
      setDocument(filteredData);
      const data3 =
        await ElectionEntitiesService.getElectionEntitiesByElectionId(record);
      setEntities(data3);
      const data4 = await ElectionParticipantsService.getByElectionId(record);
      const roleId1List: any = data4.filter(
        (p: any) => p.roleId.roleCode === "VOTER"
      );
      const otherRolesList: any = data4.filter(
        (p: any) => p.roleId.roleCode !== "VOTER"
      );
      setOrganize(otherRolesList ? otherRolesList : []);
      const data5 = await MeetingService.getByElectionId(record);
      setMeeting(data5.data[0] ? data5.data[0] : null);
      const v = await VotingRightService.getVotingRightByElectionId(record);
      roleId1List.forEach((voter: unknown) => {
        // Lấy userId từ voter (có thể là object với _id hoặc string/ObjectId)
        const voterUserId = (voter as { userId?: string | { _id?: string } })
          ?.userId;
        const voterUserIdStr =
          typeof voterUserId === "object" && voterUserId?._id
            ? String(voterUserId._id)
            : String(voterUserId || "");

        // Tìm votingRight tương ứng
        const votingRight = (v as unknown[]).find((vr: unknown) => {
          const vrVoterId = (
            vr as {
              voterId?: { userId?: string | { _id?: string } };
            }
          )?.voterId;

          if (vrVoterId && typeof vrVoterId === "object" && vrVoterId.userId) {
            const vrUserId = vrVoterId.userId;
            const vrUserIdStr =
              typeof vrUserId === "object" && vrUserId?._id
                ? String(vrUserId._id)
                : String(vrUserId || "");
            return vrUserIdStr === voterUserIdStr && vrUserIdStr !== "";
          }

          return false;
        });

        if (votingRight) {
          (voter as { percent?: number; statusVoter?: string }).percent =
            (votingRight as { shares?: number })?.shares || 0;
          (voter as { percent?: number; statusVoter?: string }).statusVoter =
            (votingRight as { voterId?: { status?: string } })?.voterId
              ?.status || "INACTIVE";
        } else {
          (voter as { percent?: number; statusVoter?: string }).percent = 0;
          (voter as { percent?: number; statusVoter?: string }).statusVoter =
            "INACTIVE";
        }
      });
      // Load election detail first to check statusData
      const decisionDetail = await DecisionService.getElectionById(record);
      const electionData = decisionDetail.data;
      const statusData = electionData?.statusData;

      // Only load voters from Excel if statusData is NOT APPROVED_SIGNED
      // If APPROVED_SIGNED, all Excel voters are already in database
      let excelVoters: unknown[] = [];
      if (statusData !== "APPROVED_SIGNED") {
        try {
          const excelResponse =
            await ElectionService.getVotersFromExcel(record);
          if (
            excelResponse?.data?.voters &&
            Array.isArray(excelResponse.data.voters)
          ) {
            // Transform Excel voters to match the structure expected by ViewDecisionModal
            excelVoters = excelResponse.data.voters.map(
              (
                excelVoter: {
                  fullName?: string;
                  email?: string;
                  phone?: string;
                  citizenId?: string;
                  percentage?: number;
                  isImportedFromExcel?: boolean;
                  rowIndex?: number;
                },
                index: number
              ) => ({
                _id: `excel-voter-${record}-${excelVoter.rowIndex || index}`,
                userId: {
                  fullName: excelVoter.fullName || "",
                  email: excelVoter.email || "",
                  phone: excelVoter.phone || "",
                  citizenId: excelVoter.citizenId || "",
                },
                roleId: {
                  roleName: "Cử tri",
                  roleCode: "VOTER",
                },
                percent: excelVoter.percentage || 0,
                statusVoter: "PENDING",
                isImportedFromExcel: true,
                rowIndex: excelVoter.rowIndex,
              })
            );
          }
        } catch (excelErr: unknown) {
          // If Excel API fails, just log and continue with database voters
          console.warn("Could not load voters from Excel:", excelErr);
        }
      }

      // Combine voters based on statusData
      let allVoters: unknown[] = [];

      if (statusData === "APPROVED_SIGNED") {
        // If approved, only use database voters (Excel voters are already in database)
        allVoters = roleId1List;
      } else {
        // If not approved, combine database and Excel voters, removing duplicates based on email
        const voterMap = new Map<string, unknown>();

        // First, add all database voters
        roleId1List.forEach((voter: unknown) => {
          const voterEmail = (voter as { userId?: { email?: string } })?.userId
            ?.email;
          if (voterEmail) {
            voterMap.set(voterEmail.toLowerCase(), voter);
          }
        });

        // Then, add Excel voters only if they don't exist in database (by email)
        excelVoters.forEach((excelVoter: unknown) => {
          const excelEmail = (excelVoter as { userId?: { email?: string } })
            ?.userId?.email;
          if (excelEmail && !voterMap.has(excelEmail.toLowerCase())) {
            voterMap.set(excelEmail.toLowerCase(), excelVoter);
          }
        });

        allVoters = Array.from(voterMap.values());
      }

      setVoters(allVoters);
      setViewDecisionData(electionData);
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
      const secrytary = await ElectionParticipantsService.getByElectionId(
        record._id
      );
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
    setRecordId(id);
  };

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
      dataIndex: "statusData",
      render: (statusData: string) => {
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
                    : statusData === "WAIT_BKS_CONFIRMED"
                      ? "purple"
                      : "gray";
        return (
          <Tag style={{ padding: 8 }} color={color}>
            {statusMap[statusData] || statusData || "Chờ duyệt"}
          </Tag>
        );
      },
    },
    {
      title: "NGÀY TẠO",
      dataIndex: "createdAt",
      render: (date: Date | string) => formatDate(date) || "-",
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
                handleViewDecision(record._id);
                handleView(record._id);
              }}
            >
              Xem và ký số
            </Tag>
          ) : (
            <Tag
              color={"blue"}
              style={{ padding: 8, cursor: "pointer", border: "1px solid " }}
              icon={<EyeOutlined />}
              onClick={() => {
                handleViewDecision(record._id);
                handleView(record._id);
              }}
            >
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

          {record.status === "CLOSED" && (
            <Button
              size="small"
              icon={<EyeOutlined />}
              style={{ color: "green" }}
              onClick={() => handleViewResult(record)}
            >
              Xem kết quả
            </Button>
          )}
        </Space>
      ),
    },
  ];
  return (
    <Card className="decision-table-card" style={{ padding: "20px" }}>
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
              setPagination({
                current: 1,
                pageSize: pagination.pageSize,
                total: pagination.total,
              });
            }}
            style={{ width: 180 }}
          >
            <Option value="">Tất cả trạng thái</Option>
            <Option value="APPROVED_SIGNED">Đã phê duyệt</Option>
            <Option value="WAIT_ENTER_DATA">Chờ nhập dữ liệu</Option>
            <Option value="WAIT_APPROVAL">Chờ duyệt</Option>
            <Option value="WAIT_BKS_CONFIRMED">
              Chờ Ban Kiểm Soát xác nhận
            </Option>
            <Option value="REJECTED">Yêu cầu chỉnh sửa</Option>
            <Option value="DRAFT">Lưu nháp</Option>
          </Select>
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
          handleViewDecision(recordId);
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
