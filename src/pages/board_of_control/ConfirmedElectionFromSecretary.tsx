import React, { useState, useEffect } from "react";
import {
  Card,
  Spin,
  Button,
  Tag,
  Input,
  message,
  Descriptions,
  Divider,
  Modal,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  InfoCircleOutlined,
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
import { formatDate } from "@/utils/format";
import type { Decision } from "@/types/Decision.interface";

const ConfirmedElectionFromSecretary: React.FC = () => {
  const [election, setElection] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(false);
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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const electionId = localStorage.getItem("currentElectionId");

  // Load election và chi tiết
  const loadElection = async () => {
    if (!electionId) {
      notify("Không tìm thấy ID cuộc bầu cử", "error");
      return;
    }

    setLoading(true);
    try {
      // Load election info
      const response = await DecisionService.getElectionById(electionId);
      const electionData = response?.data;

      if (!electionData) {
        notify("Không tìm thấy thông tin cuộc bầu cử", "error");
        return;
      }

      setElection(electionData as Decision);

      // Load chi tiết election
      await loadElectionDetail(electionId);
    } catch (err: unknown) {
      console.error("Error fetching election:", err);
      notify("Không thể tải thông tin cuộc bầu cử", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusTag = (status: string | null | undefined) => {
    if (!status) return { text: "Chưa có trạng thái", color: "default" };

    const statusMap: Record<string, { text: string; color: string }> = {
      WAIT_ENTER_DATA: { text: "Chờ nhập dữ liệu", color: "orange" },
      WAIT_APPROVAL: { text: "Chờ duyệt", color: "blue" },
      WAIT_BKS_CONFIRMED: { text: "Chờ BKS xác nhận", color: "purple" },
      APPROVED_SIGNED: { text: "Đã duyệt và ký", color: "green" },
      REJECTED: { text: "Đã từ chối", color: "red" },
      ACTIVE: { text: "Đang hoạt động", color: "green" },
      INACTIVE: { text: "Không hoạt động", color: "default" },
    };

    return statusMap[status] || { text: status, color: "default" };
  };

  const loadElectionDetail = async (electionId: string) => {
    try {
      setViewLoading(true);

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
  const handleConfirm = async () => {
    if (!electionId) return;

    try {
      showLoading();
      const response = await DecisionService.ApproveBKS(electionId);
      if (response.success) {
        notify("Xác nhận cuộc bầu cử thành công!", "success");
        setConfirmModalOpen(false);
        await loadElection(); // Reload để cập nhật trạng thái
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
  const handleReject = async () => {
    if (!electionId) return;

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
        await loadElection(); // Reload để cập nhật trạng thái
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

  if (!election) {
    return (
      <div style={{ padding: "20px", minHeight: "100vh", background: "#f0f2f5" }}>
        <Card>
          <Spin spinning={loading} tip="Đang tải thông tin cuộc bầu cử...">
            <div style={{ minHeight: "200px" }} />
          </Spin>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusTag(election.statusData);
  const electionData = election as Decision & {
    typeId?: { typeName?: string };
    votingMethodId?: { methodName?: string };
    thresholdId?: { thresholdName?: string; value?: number };
    startDate?: string | Date;
    endDate?: string | Date;
    delegationStart?: string | Date;
    delegationEnd?: string | Date;
    createdBy?: { fullName?: string; email?: string };
    rejectReason?: string;
  };

  return (
    <div style={{ padding: "20px", minHeight: "100vh", background: "#f0f2f5" }}>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileTextOutlined style={{ fontSize: 18, color: "#1890ff" }} />
            <span style={{ fontSize: 16, fontWeight: 600 }}>
              Chi tiết cuộc bầu cử
            </span>
          </div>
        }
        extra={
          <Tag
            color={statusInfo.color}
            style={{ fontSize: 12, padding: "4px 8px" }}
          >
            {statusInfo.text}
          </Tag>
        }
        style={{ marginBottom: 16 }}
      >
        <Spin spinning={loading}>
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          >
            <Descriptions.Item label="Số quyết định" span={1}>
              <Tag color="purple">{election.decisionNumber || "N/A"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Tên quyết định" span={1}>
              <strong>{election.decisionName || "N/A"}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Loại bầu cử" span={1}>
              {electionData?.typeId?.typeName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Hình thức bầu cử" span={1}>
              {electionData?.votingMethodId?.methodName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngưỡng thông qua" span={1}>
              {electionData?.thresholdId?.thresholdName || "N/A"}
              {electionData?.thresholdId?.value &&
                ` (${electionData.thresholdId.value}%)`}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày bắt đầu" span={1}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {formatDate(electionData?.startDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc" span={1}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {formatDate(electionData?.endDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian ủy quyền bắt đầu" span={1}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {formatDate(electionData?.delegationStart)}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian ủy quyền kết thúc" span={1}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {formatDate(electionData?.delegationEnd)}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo" span={1}>
              <UserOutlined style={{ marginRight: 4 }} />
              {electionData?.createdBy?.fullName || "N/A"}
              {electionData?.createdBy?.email && (
                <span style={{ color: "#999", marginLeft: 8 }}>
                  ({electionData.createdBy.email})
                </span>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" span={1}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {formatDate(election.createdAt)}
            </Descriptions.Item>
            {electionData?.rejectReason && (
              <Descriptions.Item label="Lý do từ chối" span={2}>
                <Tag color="red">
                  <InfoCircleOutlined style={{ marginRight: 4 }} />
                  {electionData.rejectReason}
                </Tag>
              </Descriptions.Item>
            )}
          </Descriptions>

          <Divider />

          {/* Nút xác nhận và từ chối */}
          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              onClick={() => setConfirmModalOpen(true)}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
              disabled={election.statusData !== "WAIT_BKS_CONFIRMED"}
            >
              Xác nhận cuộc bầu cử
            </Button>

            <Button
              danger
              size="large"
              icon={<CloseCircleOutlined />}
              onClick={() => setRejectModalOpen(true)}
              disabled={election.statusData !== "WAIT_BKS_CONFIRMED"}
            >
              Từ chối cuộc bầu cử
            </Button>

            <Button
              icon={<FileTextOutlined />}
              onClick={() => {
                setViewDecisionData(election);
                setViewModalOpen(true);
              }}
            >
              Xem chi tiết đầy đủ
            </Button>
          </div>
        </Spin>
      </Card>

      {/* Modal xác nhận */}
      <Modal
        title="Xác nhận cuộc bầu cử"
        open={confirmModalOpen}
        onOk={handleConfirm}
        onCancel={() => {
          setConfirmModalOpen(false);
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          icon: <CheckCircleOutlined />,
          type: "primary",
          style: { background: "#52c41a", borderColor: "#52c41a" },
        }}
        width={600}
      >
        <div>
          <p>
            Bạn có chắc muốn <b style={{ color: "#52c41a" }}>xác nhận</b> cuộc
            bầu cử này không?
          </p>
          <p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>
            Cuộc bầu cử: <b>{election.decisionName || "N/A"}</b>
          </p>
        </div>
      </Modal>

      {/* Modal từ chối */}
      <Modal
        title="Từ chối cuộc bầu cử"
        open={rejectModalOpen}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason("");
        }}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{
          danger: true,
          icon: <CloseCircleOutlined />,
          disabled: !rejectReason.trim(),
        }}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <p>
            Bạn có chắc muốn <b style={{ color: "red" }}>từ chối</b> cuộc bầu cử
            này không?
          </p>
          <p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>
            Cuộc bầu cử: <b>{election.decisionName || "N/A"}</b>
          </p>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            Lý do từ chối <span style={{ color: "red" }}>*</span>
          </label>
          <Input.TextArea
            rows={4}
            placeholder="Nhập lý do từ chối..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>

      {/* Modal xem chi tiết đầy đủ */}
      <ViewDecisionModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
        }}
        onSign={() => {
          loadElection();
        }}
        data={viewDecisionData}
        loading={viewLoading}
        voters={voters}
        organize={organize}
        documents={documents}
        electionentities={entities}
        meeting={meeting}
        hideSignButton={true} // Ẩn button ký số cho BKS
      />
    </div>
  );
};

export default ConfirmedElectionFromSecretary;
