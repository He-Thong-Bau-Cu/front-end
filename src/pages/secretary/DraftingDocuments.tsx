import { useEffect, useState } from "react";
import { Button, Space, message } from "antd";
import "../../style/secretary/DraftingDocuments.model.css";
import MeetingInfo from "@/components/secretary/drafting-documents/MeetingInfo";
import Attendees from "@/components/secretary/drafting-documents/Attendees";
import Organization from "@/components/secretary/drafting-documents/Organization";
import AttachedDocuments from "@/components/secretary/drafting-documents/AttachedDocuments";
import MeetingService from "@/services/MeetingService";
import ElectionTypesService from "@/services/ElectionTypesService";
import { useNotification } from "@/contexts/NotificationContext";
import { useLoading } from "@/contexts/LoadingContext";
import ThresholdsService from "@/services/ThresholdsService";
import ElectionService from "@/services/ElectionService";
import ElectionEntitiesService from "@/services/ElectionEntitiesService";
import VoterService from "@/services/VoterService";
import ElectionParticipantsService from "@/services/ElectionParticipantsService";
import ElectionDocumentService from "@/services/ElectionDocumentService";
import FileService from "@/services/FileService";
import DecisionService from "@/services/DecisionService";
import { Decision } from "@/types/Decision.interface";

const DraftingDocuments: React.FC = () => {
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [organization, setOrganization] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [election, setElection] = useState<Decision | null>(null);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const electionId = localStorage.getItem("currentElectionId") || "";
  const userId = localStorage.getItem("userId") || "";


  const fetchData = async () => {
    try {
     
      const e = await DecisionService.getElectionById(electionId);
      setElection(e);
    } catch (error) {
      console.error("Error fetching voting methods:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitAll = async () => {
    if (!meetingInfo) return message.warning("Vui lòng nhập thông tin cuộc họp!");

    try {
      showLoading();

      /* ===========================================================
            XỬ LÝ TYPE
         =========================================================== */

      let typeId;
      console.log(meetingInfo.type.typeName)

      // Nếu type là object → tạo type mới trước
      if (typeof meetingInfo.type === "object") {
        const newTypePayload = {
          typeName: meetingInfo.type.typeName,
          typeCode: meetingInfo.type.typeCode,
          description: meetingInfo.type.description,
          status: "PENDING"
        };

        const typeRes = await ElectionTypesService.createElectionType(newTypePayload);
        typeId = typeRes.data._id;

        if (!typeRes.success) {
          notify("Không thêm được thể loại bầu cử mới", "error");
          return;
        }
      } else {
        typeId = meetingInfo.type;
      }


      let thresholdid;

      // Nếu type là object → tạo type mới trước
      if (typeof meetingInfo.threshold === "object") {
        const newThresholPayload = {
          thresholdName: meetingInfo.threshold.thresholdName,
          thresholCode: meetingInfo.threshold.thresholCode,
          thresholType: meetingInfo.threshold.thresholdType,
          value: meetingInfo.threshold.value,
          description: meetingInfo.threshold.description,
          status: "PENDING"
        };

        const thresholdRes = await ThresholdsService.createThreshold(newThresholPayload);
        thresholdid = thresholdRes.data._id;

        if (!thresholdRes.success) {
          notify("Không thêm được ngưỡng thông qua mới", "error");
          return;
        }
      } else {
        thresholdid = meetingInfo.threshold
      }

      /* ===========================================================
            TẠO MEETING
      =========================================================== */
      const electionPayload = {
        typeId: typeId,
        votingMethodId: meetingInfo.method,               // <── LOẠI HÌNH BẦU CỬ SAU KHI XỬ LÝ
        thresholdId: thresholdid,
        delegationStart: meetingInfo.authorizationStart,
        delegationEnd: meetingInfo.authorizationEnd,
      };

      const election = await ElectionService.updateElection(electionId, electionPayload);
      if (election.success) {
        notify(election.message, "success");
      } else {
        notify(election.message, "error");
      }
      if (Array.isArray(meetingInfo.candidates) && meetingInfo.candidates.length > 0) {

        for (const ca of meetingInfo.candidates) {
          const electionentities = {
            electionId: electionId,
            electionTypeId: typeId,
            title: ca.title || "",
            description: ca.description || "",
            metaData: {
              fullName: ca.metaData.fullName || "",
              age: ca.metaData.age || "",
              department: ca.metaData.department || "",
              position: ca.metaData.position || "",
              experience: ca.metaData.experience || "",
              achivements: ca.metaData.achivements || "",
              imageUrl: ca.metaData.image || "",
            },
            fileUrl: ca.file || "",
            proposerId: ca.proposerId || "",
            status: "PENDING"
          };
          // GỌI API TẠO ỨNG VIÊN
          const entites = await ElectionEntitiesService.createElectionEntities(electionentities);
          if (entites.success) {
            notify(entites.message, "success");
          } else {
            notify(entites.message, "error");
          }
        }
      }

      const meeting = {
        electionId: electionId,
        location: meetingInfo.location,
        meetingDate: election.startDate,
        status: "PENDING"
      }
      const createMeeting = await MeetingService.add(meeting);
      if (!createMeeting.success) {
        notify(createMeeting.message, "error");
      }
      /* ===========================================================
            TẠO DANH SÁCH CỬ TRI
      =========================================================== */

      if (Array.isArray(attendees) && attendees.length > 0) {

        for (const ca of attendees) {
          const voter = {
            electionId: electionId,
            userId: ca.userId,
            eligible: true,
            status: "PENDING"
          };
          // GỌI API TẠO ỨNG VIÊN
          const v = await VoterService.create(voter);
          if (v.success) {
            notify(v.message, "success");
          } else {
            notify(v.message, "error");
          }
        }
      }

      /* ===========================================================
            TẠO BAN TỔ CHỨC
      =========================================================== */
      if (Array.isArray(organization) && organization.length > 0) {

        for (const ca of organization) {
          const organization = {
            electionId: electionId,
            userId: ca.userId,
            roleId: ca.roleId,
            position: ca.roleName
          };
          // GỌI API TẠO ỨNG VIÊN
          const v = await ElectionParticipantsService.createParticipant(organization);
          if (v.success) {
            notify(v.message, "success");
          } else {
            notify(v.message, "error");
          }
        }
      }

      /* ===========================================================
            UPLOAD TÀI LIỆU ĐÍNH KÈM
      =========================================================== */

      if (Array.isArray(documents) && documents.length > 0) {

        for (const ca of documents) {
          const urlKey = await FileService.upfile({ file: ca.fileObj, fileType: "election-documents", userId: userId });
          const document = {
            electionId: electionId,
            preparedBy: userId,
            title: ca.title,
            content: ca.content,
            fileUrl: urlKey.key,
            status: "PENDING",
            remarks: ca.remarks
          };
          // GỌI API TẠO ỨNG VIÊN
          const v = await ElectionDocumentService.CreateDocument(document);
          if (v.success) {
            notify(v.message, "success");
          } else {
            notify(v.message, "error");
          }
        }
      }
      /* ===========================================================
            HOÀN TẤT
      =========================================================== */
      message.success("Soạn thảo & gửi duyệt thành công!");

    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra trong quá trình gửi duyệt");
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="meeting-container">

      <div className="meeting-header">
        <h2>Soạn thảo tài liệu bầu cử</h2>
        <Space>
          <Button onClick={() => message.info("Đã lưu bản nháp.")}>
            💾 Lưu nháp
          </Button>

          <Button type="primary" onClick={handleSubmitAll}>
            📤 Gửi duyệt
          </Button>
        </Space>
      </div>

      <div className="meeting-content">
        <div className="meeting-left">
          <MeetingInfo
            data={election}
            onChange={setMeetingInfo} />
        </div>

        <div className="meeting-right">
          <Attendees onChange={setAttendees} />
          <Organization onChange={setOrganization} />
          <AttachedDocuments onChange={setDocuments} />
        </div>
      </div>
    </div>
  );
};

export default DraftingDocuments;
