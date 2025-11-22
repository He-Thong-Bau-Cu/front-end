import { useEffect, useState } from "react";
import { Button, Space, message } from "antd";
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

        // Map election data (wrap in data property for MeetingInfo component compatibility)
        setElection({
          data: {
            election: data.election,
            meetingInfo: data.meetingInfo,
          },
        });

        // Map election entities (candidates)
        setElectionentities(data.electionEntities || []);

        // Map meeting data
        setMeeting(data.meeting);

        // Map status data
        setStatusData(data.election?.statusData);

        // Map voters data
        setVoter(data.voters || []);

        // Map documents data
        setExistingDocuments(data.electionDocuments || []);

        // Map participants data (organization)
        setExistingParticipants(data.participants || []);

        // Set meeting info with all the required fields from the API response
        const meetingInfoData = {
          // Basic election info
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
    }finally{
      hideLoading();
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Validation function
  const validateForm = (isSubmit: boolean): boolean => {
    if (!meetingInfo) {
      message.warning("Vui lòng nhập thông tin cuộc họp!");
      return false;
    }

    if (isSubmit) {
      // Gửi duyệt: bắt required
      if (!meetingInfo.method) {
        message.warning("Vui lòng chọn hình thức bầu cử!");
        return false;
      }
      if (!meetingInfo.type) {
        message.warning("Vui lòng chọn thể loại bầu cử!");
        return false;
      }
      if (!meetingInfo.threshold) {
        message.warning("Vui lòng chọn ngưỡng thông qua!");
        return false;
      }
      if (!meetingInfo.location) {
        message.warning("Vui lòng nhập địa điểm!");
        return false;
      }
      if (!meetingInfo.authorizationStart || !meetingInfo.authorizationEnd) {
        message.warning("Vui lòng nhập ngày bắt đầu và kết thúc ủy quyền!");
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
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra trong quá trình lưu nháp");
    } finally {
      hideLoading();
    }
  };

  const handleSubmitAll = async () => {
    if (!validateForm(true)) return;

    try {
      showLoading();
      await handleBulkSave(true);
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra trong quá trình gửi duyệt");
    } finally {
      hideLoading();
    }
  };

  const handleBulkSave = async (isSubmitForApproval: boolean) => {
    try {
      // Chuẩn bị body tổng hợp
      const bulkBody = {
        electionId: electionId,
        meetingInfo: {
          type: meetingInfo.type,
          threshold: meetingInfo.threshold,
          method: meetingInfo.method,
          location: meetingInfo.location,
          authorizationStart: meetingInfo.authorizationStart?.toISOString(),
          authorizationEnd: meetingInfo.authorizationEnd?.toISOString(),
        },
        electionEntities: meetingInfo.candidates || [],
        electionDocuments: (documents || []).map((doc: any) => ({
          _id: doc._id, // Có _id nếu edit
          title: doc.title,
          content: doc.content || "",
          fileUrl: doc.fileUrl || "",
          remarks: doc.remarks || "",
        })),
        voters: (attendees || []).map((v: any) => ({
          _id: v._id, // Có _id nếu edit
          userId: v.userId,
          percentage: v.percentage,
        })),
        participants: (organization || []).map((p: any) => ({
          _id: p._id, // Có _id nếu edit
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
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
  return (
    <div className="meeting-container">
      <div className="meeting-header">
        <h2>Soạn thảo tài liệu bầu cử</h2>

        {statusData === "WAIT_ENTER_DATA" ? (
          <Space>
            <Button onClick={handleSaveDraft}>💾 Lưu nháp</Button>
            <Button type="primary" onClick={handleSubmitAll}>
              📤 Gửi duyệt
            </Button>
          </Space>
        ) : null}
      </div>

      <div className="meeting-content">
        <div className="meeting-left">
          <MeetingInfo
            onChange={setMeetingInfo}
            data={election}
            electionentities={electionentities}
            meeting={meeting}
          />
        </div>
        <div className="meeting-right">
          {voter && voter.length > 0 && (
            <Attendees onChange={setAttendees} data={voter} />
          )}
          {organization && organization.length > 0 && (
            <Organization onChange={setOrganization} data={organization} />
          )}
          <AttachedDocuments
            onChange={setDocuments}
            electionId={electionId}
            initialDocuments={existingDocuments}
          />
        </div>
      </div>
    </div>
  );
};

export default DraftingDocuments;
