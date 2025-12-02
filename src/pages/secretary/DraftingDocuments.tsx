import { useEffect, useState } from "react";
import { Button, Space, Tag } from "antd";
import { SaveOutlined, SendOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "../../style/secretary/DraftingDocuments.model.css";
import MeetingInfo from "@/components/secretary/drafting-documents/MeetingInfo";
import Attendees from "@/components/secretary/drafting-documents/Attendees";
import Organization from "@/components/secretary/drafting-documents/Organization";
import AttachedDocuments from "@/components/secretary/drafting-documents/AttachedDocuments";
import { useNotification } from "@/contexts/NotificationContext";
import { useLoading } from "@/contexts/LoadingContext";
import ElectionService from "@/services/ElectionService";
import { ElectionEntities } from "@/types/ElectionEntities.interface";
import { Meeting } from "@/types/Meeting.interface";
import { USER_ROLE } from "@/enums/STATUS";
const DraftingDocuments: React.FC = () => {
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [organization, setOrganization] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [election, setElection] = useState<any>(null);
  const [electionentities, setElectionentities] = useState<ElectionEntities[]>(
    []
  );
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [statusData, setStatusData] = useState<string | null>(null);
  const [voter, setVoter] = useState<any[] | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const electionId = localStorage.getItem("currentElectionId") || "";
  const userId = localStorage.getItem("userId") || "";
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [existingParticipants, setExistingParticipants] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      showLoading();
      const response = await ElectionService.getDraftData(electionId);

      if (response && response.success) {
        const data = response.data;

        setElection({
          data: {
            election: data.election,
            meetingInfo: data.meetingInfo,
          },
        });

        setElectionentities(data.electionEntities || []);

        setMeeting(data.meeting);

        setStatusData(data.election?.statusData);

        setVoter(data.voters || []);

        setExistingDocuments(data.electionDocuments || []);

        setExistingParticipants(data.participants || []);

        const meetingInfoData = {
          decisionName: data.election?.decisionName,
          decisionNumber: data.election?.decisionNumber,

          // Meeting info from API
          type: data.meetingInfo?.type,
          typeDetails: data.meetingInfo?.typeDetails,
          method: data.meetingInfo?.method,
          methodDetails: data.meetingInfo?.methodDetails,
          threshold: data.meetingInfo?.threshold,
          thresholdDetails: data.meetingInfo?.thresholdDetails,
          location: data.meetingInfo?.location,

          // Authorization dates
          authorizationStart: data.meetingInfo?.authorizationStart
            ? dayjs(data.meetingInfo.authorizationStart)
            : null,
          authorizationEnd: data.meetingInfo?.authorizationEnd
            ? dayjs(data.meetingInfo.authorizationEnd)
            : null,

          // Candidates list
          candidates: data.electionEntities || [],
        };
        setMeetingInfo(meetingInfoData);

        // Set attendees (voters) - map the voter data properly
        const mappedAttendees = (data.voters || []).map((voter: any) => ({
          _id: voter._id,
          userId: voter.userId,
          user: voter.user,
          eligible: voter.eligible,
          status: voter.status,
          percentage: voter.percentage,
          createdBy: voter.createdBy,
        }));
        setAttendees(mappedAttendees);

        // Set organization (participants) - map the participant data properly
        const mappedOrganization = (data.participants || []).map(
          (participant: any) => ({
            _id: participant._id,
            userId: participant.userId,
            user: participant.user,
            roleId: participant.roleId,
            role: participant.role,
            roleName: participant.role?.roleName,
            position: participant.position,
            status: participant.status,
            createdBy: participant.createdBy,
          })
        );
        setOrganization(mappedOrganization);

        // Set documents
        setDocuments(data.electionDocuments || []);
        notify("Tải dữ liệu thành công", "success");
      } else {
        console.error("Failed to fetch draft data:", response?.data?.message);
        notify("Không thể tải dữ liệu soạn thảo", "error");
      }
    } catch (error) {
      console.error("Error fetching draft data:", error);
      notify("Có lỗi xảy ra khi tải dữ liệu", "error");
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Validation function
  const validateForm = (isSubmit: boolean): boolean => {
    if (!meetingInfo) {
      notify("Vui lòng nhập thông tin cuộc họp!", "warning");
      return false;
    }

    if (isSubmit) {
      // Gửi duyệt: bắt required
      if (!meetingInfo.method) {
        notify("Vui lòng chọn hình thức bầu cử!", "warning");
        return false;
      }
      if (!meetingInfo.type) {
        notify("Vui lòng chọn thể loại bầu cử!", "warning");
        return false;
      }
      if (!meetingInfo.threshold) {
        notify("Vui lòng chọn ngưỡng thông qua!", "warning");
        return false;
      }
      if (!meetingInfo.location) {
        notify("Vui lòng nhập địa điểm!", "warning");
        return false;
      }
      if (!meetingInfo.authorizationStart || !meetingInfo.authorizationEnd) {
        notify("Vui lòng nhập ngày bắt đầu và kết thúc ủy quyền!", "warning");
        return false;
      }

      // Kiểm tra candidates/electionEntities
      if (!meetingInfo.candidates || !Array.isArray(meetingInfo.candidates) || meetingInfo.candidates.length === 0) {
        notify("Vui lòng thêm ít nhất một ứng viên/bầu chọn trước khi gửi duyệt", "warning");
        return false;
      }

      // Kiểm tra documents
      if (!documents || !Array.isArray(documents) || documents.length === 0) {
        notify("Vui lòng thêm ít nhất một tài liệu trước khi gửi duyệt", "warning");
        return false;
      }

      // Kiểm tra voters
      if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
        notify("Vui lòng thêm ít nhất một cử tri trước khi gửi duyệt", "warning");
        return false;
      }

      // Kiểm tra tổng % cổ phần không vượt quá 100%
      const totalPercentage = attendees.reduce(
        (sum, v) => sum + (Number(v.percentage) || 0),
        0
      );
      if (totalPercentage > 100) {
        notify(`Tổng cổ phần không được vượt quá 100%! (Hiện tại: ${totalPercentage}%)`, "warning");
        return false;
      }

      // Kiểm tra participants (thành viên ban tổ chức)
      const participantsList = organization || [];
      const mapParticipants = participantsList.filter((p: any) => p?.roleId?.roleCode !== USER_ROLE.VOTER);
      if (!Array.isArray(mapParticipants) || mapParticipants.length === 0) {
        notify("Vui lòng thêm ít nhất một thành viên tổ chức trước khi gửi duyệt", "warning");
        return false;
      }

      // Kiểm tra từng participant phải có đầy đủ thông tin
      const invalidParticipants = participantsList.filter(
        (p: any) => !p.userId || !p.roleId
      );
      if (invalidParticipants.length > 0) {
        notify("Vui lòng kiểm tra lại thông tin thành viên tổ chức, một số thành viên thiếu thông tin", "warning");
        return false;
      }
    }
    // Lưu nháp: không bắt required
    return true;
  };

  const handleSaveDraft = async () => {
    if (!validateForm(false)) return;

    try {
      showLoading();
      await handleBulkSave(false);
    } catch (err: any) {
      console.error(err);
      // Message đã được hiển thị trong handleBulkSave, không cần hiển thị lại
      // Chỉ hiển thị nếu chưa có message
      if (!err?.response?.data?.message && !err?.message) {
        notify("Có lỗi xảy ra trong quá trình lưu nháp", "error");
      }
    } finally {
      hideLoading();
    }
  };

  const handleSubmitAll = async () => {
    if (!validateForm(true)) return;

    try {
      showLoading();
      await handleBulkSave(true);
    } catch (err: any) {
      console.error(err);
      // Message đã được hiển thị trong handleBulkSave, không cần hiển thị lại
      // Chỉ hiển thị nếu chưa có message
      if (!err?.response?.data?.message && !err?.message) {
        notify("Có lỗi xảy ra trong quá trình gửi duyệt", "error");
      }
    } finally {
      hideLoading();
    }
  };

  const handlePreviewPdf = async () => {
    try {
      showLoading();
      const response = await ElectionService.previewPdf(electionId);

      // Interceptor đã unwrap response, nên response chính là response.data
      // Nếu responseType là 'blob', response.data sẽ là Blob
      // Nhưng interceptor trả về response.data, nên response chính là Blob
      let actualBlob: Blob;

      if (response instanceof Blob) {
        actualBlob = response;
      } else {
        // Nếu không phải Blob, có thể là error response dạng JSON
        // Thử parse để lấy error message
        console.error("Response is not a Blob:", response);

        if (response && typeof response === 'object') {
          // Nếu là object, có thể là error response
          const errorMsg = (response as any).message || "Không thể tạo preview PDF";
          throw new Error(errorMsg);
        }

        throw new Error("Response is not a valid Blob");
      }

      const url = window.URL.createObjectURL(actualBlob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.click();

      // Revoke URL sau một chút để đảm bảo link đã được click
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      notify("Đang mở preview PDF", "success");
    } catch (err: any) {
      console.error("Error in handlePreviewPdf:", err);

      // Xử lý error message
      let errorMessage = "Có lỗi xảy ra khi xem preview";

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.response?.data) {
        // Nếu error có response.data
        if (err.response.data instanceof Blob) {
          // Nếu là Blob, có thể là error PDF, thử parse
          errorMessage = "Không thể tạo preview PDF";
        } else if (typeof err.response.data === 'object' && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }

      notify(errorMessage, "error");
    } finally {
      hideLoading();
    }
  };

  const getStatusTag = (status: string | null) => {
    if (!status) return { text: "Chưa có trạng thái", color: "default" };

    const statusMap: Record<string, { text: string; color: string }> = {
      WAIT_ENTER_DATA: { text: "Chờ nhập dữ liệu", color: "orange" },
      WAIT_APPROVAL: { text: "Chờ duyệt", color: "blue" },
      APPROVED_SIGNED: { text: "Đã duyệt và ký", color: "green" },
      REJECTED: { text: "Đã từ chối", color: "red" },
      ACTIVE: { text: "Đang hoạt động", color: "green" },
      INACTIVE: { text: "Không hoạt động", color: "default" },
    };

    return statusMap[status] || { text: status, color: "default" };
  };

  const handleBulkSave = async (isSubmitForApproval: boolean) => {
    try {
      // Chuẩn bị data trước
      const participantsList = organization || [];
      const candidatesList = meetingInfo?.candidates || [];
      const documentsList = documents || [];
      const votersList = attendees || [];

      // Validation bổ sung trước khi gửi (đặc biệt cho gửi duyệt)
      if (isSubmitForApproval) {
        // Kiểm tra candidates
        if (!Array.isArray(candidatesList) || candidatesList.length === 0) {
          notify("Vui lòng thêm ít nhất một ứng viên/bầu chọn trước khi gửi duyệt", "warning");
          return;
        }

        // Kiểm tra documents
        if (!Array.isArray(documentsList) || documentsList.length === 0) {
          notify("Vui lòng thêm ít nhất một tài liệu trước khi gửi duyệt", "warning");
          return;
        }

        // Kiểm tra voters
        if (!Array.isArray(votersList) || votersList.length === 0) {
          notify("Vui lòng thêm ít nhất một cử tri trước khi gửi duyệt", "warning");
          return;
        }

        // Kiểm tra tổng % cổ phần không vượt quá 100%
        const totalPercentage = votersList.reduce(
          (sum, v) => sum + (Number(v.percentage) || 0),
          0
        );
        if (totalPercentage > 100) {
          notify(`Tổng cổ phần không được vượt quá 100%! (Hiện tại: ${totalPercentage}%)`, "warning");
          return;
        }

        // Kiểm tra participants
        if (!Array.isArray(participantsList) || participantsList.length === 0) {
          notify("Vui lòng thêm ít nhất một thành viên tổ chức trước khi gửi duyệt", "warning");
          return;
        }
      }

      // Chuẩn bị body tổng hợp
      const bulkBody = {
        electionId: electionId,
        meetingInfo: {
          type: meetingInfo.type,
          threshold: meetingInfo.threshold,
          method: meetingInfo.method,
          location: meetingInfo.location,
          // Đảm bảo chuyển đổi dayjs thành ISO string đúng cách
          authorizationStart: meetingInfo.authorizationStart
            ? (typeof meetingInfo.authorizationStart === 'string'
                ? meetingInfo.authorizationStart
                : dayjs(meetingInfo.authorizationStart).toISOString())
            : null,
          authorizationEnd: meetingInfo.authorizationEnd
            ? (typeof meetingInfo.authorizationEnd === 'string'
                ? meetingInfo.authorizationEnd
                : dayjs(meetingInfo.authorizationEnd).toISOString())
            : null,
        },
        electionEntities: candidatesList.map((candidate: any) => {
          const result = {
            _id: candidate._id,
            title: candidate.title,
            description: candidate.description || "",
            metaData: {
              ...candidate.metaData,
              type: candidate.formType || candidate.metaData?.type || "person", // Đảm bảo type có trong metaData
            },
            fileUrl: candidate.fileUrl || "", // Lưu fileUrl vào electionEntities (giống AttachedDocuments)
          };

          // Debug: Log để kiểm tra fileUrl
          if (result.fileUrl) {
            console.log(`Sending candidate with fileUrl:`, {
              title: result.title,
              fileUrl: result.fileUrl
            });
          }

          return result;
        }),
        electionDocuments: documentsList.map((doc: any) => ({
          _id: doc._id, // Có _id nếu edit
          title: doc.title,
          content: doc.content || "",
          fileUrl: doc.fileUrl || "",
          remarks: doc.remarks || "",
        })),
        voters: votersList.map((v: any) => ({
          _id: v._id,
          userId: v.userId,
          percentage: v.percentage,
        })),
        participants: participantsList.map((p: any) => ({
          _id: p._id,
          userId: p.userId,
          roleId: p.roleId,
          position: p.roleName || p.position,
        })),
        isSubmitForApproval: isSubmitForApproval,
      };

      const response = await ElectionService.bulkSaveDraft(bulkBody);

      if (response && response.data && response.data.success) {
        notify(
          isSubmitForApproval
            ? "Gửi duyệt thành công!"
            : "Lưu nháp thành công!",
          "success"
        );
        // Refresh data
        await fetchData();
      } else {
        notify(response?.data?.message || "Có lỗi xảy ra", "error");
      }
    } catch (err: any) {
      console.error(err);
      // Hiển thị message từ backend nếu có
      const errorMessage = err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
      notify(errorMessage, "error");
      throw err;
    }
  };
  return (
    <div className="meeting-container">
      <div className="meeting-header">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h2 style={{ margin: 0 }}>Soạn thảo tài liệu bầu cử</h2>
          {statusData && (
            <Tag color={getStatusTag(statusData).color}>
              {getStatusTag(statusData).text}
            </Tag>
          )}
        </div>

        <Space>
          {statusData === "WAIT_ENTER_DATA" && (
            <>
              <Button icon={<SaveOutlined />} onClick={handleSaveDraft}>
                Lưu nháp
              </Button>
              <Button type="primary" icon={<SendOutlined />} onClick={handleSubmitAll}>
                Gửi duyệt
              </Button>
            </>
          )}
          <Button icon={<EyeOutlined />} onClick={handlePreviewPdf}>
            Xem preview PDF
          </Button>
        </Space>
      </div>

      <div className="meeting-content">
        <div className="meeting-left">
          <MeetingInfo
            onChange={setMeetingInfo}
            data={election}
            electionentities={electionentities}
            meeting={meeting}
            disabled={statusData !== "WAIT_ENTER_DATA"}
          />
        </div>
        <div className="meeting-right">
          <Attendees
            onChange={setAttendees}
            data={voter}
            disabled={statusData !== "WAIT_ENTER_DATA"}
            organizationMembers={organization}
          />
          <Organization
            onChange={setOrganization}
            data={organization}
            disabled={statusData !== "WAIT_ENTER_DATA"}
            attendeesList={attendees}
          />
          <AttachedDocuments
            onChange={setDocuments}
            electionId={electionId}
            initialDocuments={existingDocuments}
            disabled={statusData !== "WAIT_ENTER_DATA"}
          />
        </div>
      </div>
    </div>
  );
};

export default DraftingDocuments;
