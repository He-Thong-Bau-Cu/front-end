import React, { useState, useEffect } from "react";
import {
  Card,
  Spin,
  Button,
  Space,
  Tag,
  Input,
  message,
  Modal,
  Table,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import ViewDecisionModal from "@/components/preside/management-decision/ViewDecisionModal";
import DecisionService from "@/services/DecisionService";
import ElectionDocumentService from "@/services/ElectionDocumentService";
import ElectionEntitiesService from "@/services/ElectionEntitiesService";
import ElectionParticipantsService from "@/services/ElectionParticipantsService";
import ElectionService from "@/services/ElectionService";
import MeetingService from "@/services/MeetingService";
import VotingRightService from "@/services/VotingRightService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import type { Decision } from "@/types/Decision.interface";

const ConfirmedElectionFromSecretary: React.FC = () => {
  const [elections, setElections] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedElection, setSelectedElection] = useState<Decision | null>(
    null
  );
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewDecisionData, setViewDecisionData] = useState<Decision | null>(
    null
  );
  const [documents, setDocuments] = useState<unknown[]>([]);
  const [voters, setVoters] = useState<unknown[]>([]);
  const [organize, setOrganize] = useState<unknown[]>([]);
  const [entities, setEntities] = useState<unknown[]>([]);
  const [meeting, setMeeting] = useState<unknown | null>(null);
  const [searchText, setSearchText] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [rejectingElectionId, setRejectingElectionId] = useState<string | null>(
    null
  );
  const [confirmingElectionId, setConfirmingElectionId] = useState<
    string | null
  >(null);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  // Load danh sách elections có status WAIT_BKS_CONFIRMED
  const loadElections = async () => {
    setLoading(true);
    try {
      const response = await DecisionService.getAllDecisions({
        page: 1,
        limit: 100,
        statusData: "WAIT_BKS_CONFIRMED",
        textSearch: searchText.trim() || undefined,
      });
      setElections(response?.content || []);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      notify(
        error?.response?.data?.message || "Không thể tải danh sách cuộc bầu cử",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  // Load chi tiết election khi chọn
  const handleSelectElection = async (election: Decision) => {
    setSelectedElection(election);
    await loadElectionDetail(election._id);
  };

  const loadElectionDetail = async (electionId: string) => {
    try {
      setViewLoading(true);
      setViewModalOpen(true);

      // Load documents
      const data1 =
        await ElectionDocumentService.getDocumentByElectionId(electionId);
      const filteredData = (data1 as unknown[]).filter(
        (item: unknown) =>
          (item as { type?: string })?.type !== "voter-signed-ballots"
      );
      setDocuments(filteredData);

      // Load entities
      const data3 =
        await ElectionEntitiesService.getElectionEntitiesByElectionId(
          electionId
        );
      setEntities(data3 as unknown[]);

      // Load participants
      const data4 =
        await ElectionParticipantsService.getByElectionId(electionId);
      const roleId1List = (data4 as unknown[]).filter(
        (p: unknown) =>
          (p as { roleId?: { roleCode?: string } })?.roleId?.roleCode ===
          "VOTER"
      ) as unknown[];
      const otherRolesList = (data4 as unknown[]).filter(
        (p: unknown) =>
          (p as { roleId?: { roleCode?: string } })?.roleId?.roleCode !==
          "VOTER"
      ) as unknown[];
      setOrganize(otherRolesList ? otherRolesList : []);

      // Load meeting
      const data5 = await MeetingService.getByElectionId(electionId);
      setMeeting((data5 as { data?: unknown[] })?.data?.[0] || null);

      // Load voting rights
      const v = await VotingRightService.getVotingRightByElectionId(electionId);
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
      const decisionDetail = await DecisionService.getElectionById(electionId);
      const electionData = (decisionDetail as { data?: Decision })?.data;
      const statusData = electionData?.statusData;

      // Only load voters from Excel if statusData is NOT APPROVED_SIGNED
      // If APPROVED_SIGNED, all Excel voters are already in database
      let excelVoters: unknown[] = [];
      if (statusData !== "APPROVED_SIGNED") {
        try {
          const excelResponse =
            await ElectionService.getVotersFromExcel(electionId);
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
                _id: `excel-voter-${electionId}-${excelVoter.rowIndex || index}`,
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

      // Set election detail (already loaded above)
      setViewDecisionData(electionData || null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      notify(
        error?.response?.data?.message || "Không thể tải chi tiết cuộc bầu cử",
        "error"
      );
      setViewModalOpen(false);
      setViewDecisionData(null);
    } finally {
      setViewLoading(false);
    }
  };

  // Xác nhận cuộc bầu cử
  const handleConfirm = async (electionId: string) => {
    try {
      showLoading();
      const response = await DecisionService.ApproveBKS(electionId);
      if (response.success) {
        notify("Xác nhận cuộc bầu cử thành công!", "success");
        setConfirmModalOpen(false);
        setConfirmingElectionId(null);
        await loadElections();
      } else {
        notify(response.message || "Xác nhận thất bại", "error");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      notify(
        error?.response?.data?.message || "Có lỗi xảy ra khi xác nhận",
        "error"
      );
    } finally {
      hideLoading();
    }
  };

  // Từ chối cuộc bầu cử
  const handleReject = async (electionId: string) => {
    if (!rejectReason.trim()) {
      message.error("Vui lòng nhập lý do từ chối!");
      return;
    }

    try {
      showLoading();
      const response = await DecisionService.RejectBKS(
        electionId,
        rejectReason.trim()
      );
      if (response.success) {
        notify("Từ chối cuộc bầu cử thành công!", "success");
        setRejectModalOpen(false);
        setRejectReason("");
        setRejectingElectionId(null);
        await loadElections();
      } else {
        notify(response.message || "Từ chối thất bại", "error");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      notify(
        error?.response?.data?.message || "Có lỗi xảy ra khi từ chối",
        "error"
      );
    } finally {
      hideLoading();
    }
  };

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

  const filteredElections = elections.filter((election) => {
    if (!searchText.trim()) return true;
    const search = searchText.toLowerCase();
    return (
      election.decisionNumber?.toLowerCase().includes(search) ||
      election.decisionName?.toLowerCase().includes(search)
    );
  });

  // Định nghĩa columns cho table
  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center" as const,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Số quyết định",
      dataIndex: "decisionNumber",
      key: "decisionNumber",
      width: 150,
      render: (text: string) => (
        <Tag color="purple" style={{ fontSize: 13, padding: "4px 8px" }}>
          {text || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Tên quyết định",
      dataIndex: "decisionName",
      key: "decisionName",
      width: 300,
      render: (text: string) => (
        <span style={{ fontWeight: 600, fontSize: 14 }}>
          {text || "Chưa có tên"}
        </span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: "Trạng thái",
      dataIndex: "statusData",
      key: "statusData",
      width: 150,
      render: () => (
        <Tag color="purple" style={{ fontSize: 12, padding: "4px 8px" }}>
          Chờ xác nhận
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 250,
      fixed: "right" as const,
      render: (_: unknown, record: Decision) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleSelectElection(record)}
              style={{ color: "#1890ff" }}
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              setConfirmingElectionId(record._id);
              setConfirmModalOpen(true);
            }}
            style={{ background: "#52c41a", borderColor: "#52c41a" }}
          >
            Xác nhận
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => {
              setRejectingElectionId(record._id);
              setRejectModalOpen(true);
            }}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px", minHeight: "100vh", background: "#f0f2f5" }}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileTextOutlined style={{ fontSize: 18, color: "#1890ff" }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              Danh sách cuộc bầu cử chờ xác nhận
            </span>
          </div>
        }
        extra={
          <Tag color="purple" style={{ fontSize: 12, padding: "4px 8px" }}>
            {elections.length} cuộc bầu cử
          </Tag>
        }
        style={{ minHeight: "calc(100vh - 100px)" }}
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm kiếm theo số quyết định, tên quyết định..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            style={{ width: 400, borderRadius: 6 }}
          />
        </div>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredElections}
            rowKey={(record) => record._id || String(Math.random())}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} cuộc bầu cử`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: loading ? (
                "Đang tải..."
              ) : searchText ? (
                "Không tìm thấy cuộc bầu cử nào"
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#999",
                  }}
                >
                  <FileTextOutlined
                    style={{ fontSize: 48, marginBottom: 16 }}
                  />
                  <p style={{ margin: 0, fontSize: 14 }}>
                    Chưa có cuộc bầu cử nào chờ xác nhận
                  </p>
                </div>
              ),
            }}
          />
        </Spin>
      </Card>

      {/* Modal xác nhận */}
      <Modal
        title="Xác nhận cuộc bầu cử"
        open={confirmModalOpen}
        onOk={() => {
          if (confirmingElectionId) {
            handleConfirm(confirmingElectionId);
          }
        }}
        onCancel={() => {
          setConfirmModalOpen(false);
          setConfirmingElectionId(null);
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ icon: <CheckCircleOutlined />, type: "primary" }}
      >
        <p>
          Bạn có chắc muốn <b style={{ color: "#52c41a" }}>xác nhận</b> cuộc bầu
          cử này không?
        </p>
        <p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>
          Cuộc bầu cử:{" "}
          <b>
            {elections.find((e) => e._id === confirmingElectionId)
              ?.decisionName || "N/A"}
          </b>
        </p>
      </Modal>

      {/* Modal từ chối */}
      <Modal
        title="Từ chối cuộc bầu cử"
        open={rejectModalOpen}
        onOk={() => {
          if (rejectingElectionId) {
            handleReject(rejectingElectionId);
          }
        }}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason("");
          setRejectingElectionId(null);
        }}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, icon: <CloseCircleOutlined /> }}
      >
        <p>
          Bạn có chắc muốn <b style={{ color: "red" }}>từ chối</b> cuộc bầu cử
          này không?
        </p>
        <p
          style={{
            color: "#999",
            fontSize: 12,
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          Cuộc bầu cử:{" "}
          <b>
            {elections.find((e) => e._id === rejectingElectionId)
              ?.decisionName || "N/A"}
          </b>
        </p>
        <Input.TextArea
          rows={4}
          placeholder="Nhập lý do từ chối..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          style={{ marginTop: 12 }}
        />
      </Modal>

      {/* Modal xem chi tiết */}
      <ViewDecisionModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedElection(null);
        }}
        onSign={() => {
          loadElections();
          if (selectedElection) {
            loadElectionDetail(selectedElection._id);
          }
        }}
        data={viewDecisionData}
        loading={viewLoading}
        voters={voters}
        organize={organize}
        documents={documents}
        electionentities={entities}
        meeting={meeting}
      />
    </div>
  );
};

export default ConfirmedElectionFromSecretary;
