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
import FileService from "@/services/FileService";
import ElectionDocumentService from "@/services/ElectionDocumentService";
import * as XLSX from "xlsx";
import { ElectionEntities } from "@/types/ElectionEntities.interface";
import { Meeting } from "@/types/Meeting.interface";
import { USER_ROLE } from "@/enums/STATUS";
import { formatDate } from "@/utils/format";
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

  // Helper function để lấy roleId từ participant (hỗ trợ cả object và string)
  const getRoleId = (participant: any): string | null => {
    if (!participant || !participant.roleId) {
      return null;
    }

    // Nếu roleId là string
    if (typeof participant.roleId === "string") {
      return participant.roleId;
    }

    // Nếu roleId là object có _id
    if (participant.roleId._id) {
      return participant.roleId._id;
    }

    return null;
  };

  // Helper function để kiểm tra có đủ 3 role bắt buộc không
  const checkRequiredRoles = (
    participantsList: any[]
  ): { isValid: boolean; missingRoles: string[] } => {
    const requiredRoleIds = [
      "693a5ba91d62567f679795cb", // Trưởng ban tổ chức
      "693a5bb31d62567f679795d2", // Thành viên ban tổ chức
    ];

    const roleIdNames: Record<string, string> = {
      "693a5ba91d62567f679795cb": "Trưởng ban tổ chức",
      "693a5bb31d62567f679795d2": "Thành viên ban tổ chức",
    };

    const existingRoleIds = participantsList
      .map((p: any) => getRoleId(p))
      .filter((id: string | null) => id !== null) as string[];

    const missingRoles: string[] = [];
    requiredRoleIds.forEach((roleId) => {
      if (!existingRoleIds.includes(roleId)) {
        missingRoles.push(roleIdNames[roleId]);
      }
    });

    return {
      isValid: missingRoles.length === 0,
      missingRoles,
    };
  };

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
      if (
        !meetingInfo.candidates ||
        !Array.isArray(meetingInfo.candidates) ||
        meetingInfo.candidates.length === 0
      ) {
        notify(
          "Vui lòng thêm ít nhất một ứng viên/bầu chọn trước khi gửi duyệt",
          "warning"
        );
        return false;
      }

      // Kiểm tra nếu hình thức bầu cử là YES_NO_ABSTAIN thì chỉ cho phép 1 bản ghi
      const methodCode =
        meetingInfo.methodDetails?.methodCode ||
        election?.data?.meetingInfo?.methodDetails?.methodCode;
      if (
        methodCode === "YES_NO_ABSTAIN" &&
        meetingInfo.candidates.length > 1
      ) {
        notify(
          "Hình thức bầu cử YES-NO chỉ cho phép 1 nội dung bầu chọn. Vui lòng chỉ nhập 1 bản ghi.",
          "warning"
        );
        return false;
      }

      // Kiểm tra documents
      // Nếu có voters import từ Excel, file Excel sẽ được tạo tự động → không bắt buộc phải có tài liệu khác
      const hasImportedVoters =
        attendees &&
        Array.isArray(attendees) &&
        attendees.some((v: any) => v.isImportedFromExcel === true);
      if (!hasImportedVoters) {
        // Chỉ bắt buộc có tài liệu nếu KHÔNG có voters import từ Excel
        if (!documents || !Array.isArray(documents) || documents.length === 0) {
          notify(
            "Vui lòng thêm ít nhất một tài liệu trước khi gửi duyệt",
            "warning"
          );
          return false;
        }

        // Kiểm tra voters
        if (!attendees || !Array.isArray(attendees) || attendees.length === 0) {
          notify(
            "Vui lòng thêm ít nhất một cử tri trước khi gửi duyệt",
            "warning"
          );
          return false;
        }
      }

      // Kiểm tra participants (thành viên ban tổ chức)
      const participantsList = organization || [];
      const mapParticipants = participantsList.filter(
        (p: any) => p?.roleId?.roleCode !== USER_ROLE.VOTER
      );
      if (!Array.isArray(mapParticipants) || mapParticipants.length === 0) {
        notify(
          "Vui lòng thêm ít nhất một thành viên tổ chức trước khi gửi duyệt",
          "warning"
        );
        return false;
      }

      // Kiểm tra từng participant phải có đầy đủ thông tin
      const invalidParticipants = participantsList.filter(
        (p: any) => !p.userId || !p.roleId
      );
      if (invalidParticipants.length > 0) {
        notify(
          "Vui lòng kiểm tra lại thông tin thành viên tổ chức, một số thành viên thiếu thông tin",
          "warning"
        );
        return false;
      }

      // Kiểm tra phải có đủ 3 role bắt buộc: Trưởng ban tổ chức, Thành viên ban tổ chức, Ban kiểm soát
      const roleCheck = checkRequiredRoles(mapParticipants);
      if (!roleCheck.isValid) {
        notify(
          `Vui lòng thêm đầy đủ các thành viên tổ chức bắt buộc: ${roleCheck.missingRoles.join(", ")}`,
          "warning"
        );
        return false;
      }
    }

    // Kiểm tra tổng % cổ phần phải lớn hơn 51% (áp dụng cho cả lưu nháp và gửi duyệt)
    if (attendees && Array.isArray(attendees) && attendees.length > 0) {
      const totalPercentage = attendees.reduce(
        (sum, v) => sum + (Number(v.percentage) || 0),
        0
      );
      if (totalPercentage <= 51) {
        notify(
          `Tổng cổ phần phải lớn hơn 51%! (Hiện tại: ${totalPercentage}%)`,
          "warning"
        );
        return false;
      }
      if (totalPercentage > 100) {
        notify(
          `Tổng cổ phần không được vượt quá 100%! (Hiện tại: ${totalPercentage}%)`,
          "warning"
        );
        return false;
      }
    }

    // Lưu nháp: không bắt required các field khác
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

        if (response && typeof response === "object") {
          // Nếu là object, có thể là error response
          const errorMsg =
            (response as any).message || "Không thể tạo preview PDF";
          throw new Error(errorMsg);
        }

        throw new Error("Response is not a valid Blob");
      }

      const url = window.URL.createObjectURL(actualBlob);
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
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
        } else if (
          typeof err.response.data === "object" &&
          err.response.data.message
        ) {
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
      WAIT_BKS_CONFIRMED: { text: "Chờ BKS xác nhận", color: "purple" },
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
      let hasDocuments = false;
      console.log("documentsList", documentsList);
      console.log("participantsList before filter:", participantsList);
      // Validation bổ sung trước khi gửi (đặc biệt cho gửi duyệt)
      if (isSubmitForApproval) {
        // Kiểm tra candidates
        if (!Array.isArray(candidatesList) || candidatesList.length === 0) {
          notify(
            "Vui lòng thêm ít nhất một ứng viên/bầu chọn trước khi gửi duyệt",
            "warning"
          );
          return;
        }

        // Kiểm tra nếu hình thức bầu cử là YES_NO_ABSTAIN thì chỉ cho phép 1 bản ghi
        const methodCode =
          meetingInfo?.methodDetails?.methodCode ||
          election?.data?.meetingInfo?.methodDetails?.methodCode;
        if (methodCode === "YES_NO_ABSTAIN" && candidatesList.length > 1) {
          notify(
            "Hình thức bầu cử YES-NO chỉ cho phép 1 nội dung bầu chọn. Vui lòng chỉ nhập 1 bản ghi.",
            "warning"
          );
          return;
        }

        // Kiểm tra documents
        // Nếu có voters import từ Excel, file Excel sẽ được tạo tự động → không bắt buộc phải có tài liệu khác
        const hasImportedVoters =
          votersList &&
          Array.isArray(votersList) &&
          votersList.some((v: any) => v.isImportedFromExcel === true);
        if (!hasImportedVoters) {
          // Chỉ bắt buộc có tài liệu nếu KHÔNG có voters import từ Excel
          if (!Array.isArray(documentsList) || documentsList.length === 0) {
            notify(
              "Vui lòng thêm ít nhất một tài liệu trước khi gửi duyệt",
              "warning"
            );
            return;
          }
        }

        //Đánh dấu là có tài liệu rồi để be không báo lỗi nữa, kể cả là voters import từ excel
        hasDocuments = documentsList?.some(
          (doc: any) =>
            doc.type === "voters-import-excel" ||
            (doc.fileUrl && doc.fileUrl.includes("voters-import-excel"))
        );

        // Kiểm tra voters
        // Nếu có voters import từ Excel, không cần kiểm tra voters thông thường
        // Vì voters import từ Excel đã được tính là có voters rồi
        if (!hasImportedVoters) {
          // Chỉ kiểm tra voters nếu KHÔNG có voters import từ Excel
          if (!Array.isArray(votersList) || votersList.length === 0) {
            notify(
              "Vui lòng thêm ít nhất một cử tri trước khi gửi duyệt",
              "warning"
            );
            return;
          }
        }

        // Kiểm tra tổng % cổ phần
        const totalPercentage = votersList?.reduce(
          (sum, v) => sum + (Number(v.percentage) || 0),
          0
        );
        // Kiểm tra tổng % cổ phần phải lớn hơn 51%
        if (totalPercentage <= 51) {
          notify(
            `Tổng cổ phần phải lớn hơn 51%! (Hiện tại: ${totalPercentage}%)`,
            "warning"
          );
          return;
        }
        // Kiểm tra tổng % cổ phần không vượt quá 100%
        if (totalPercentage > 100) {
          notify(
            `Tổng cổ phần không được vượt quá 100%! (Hiện tại: ${totalPercentage}%)`,
            "warning"
          );
          return;
        }

        // Kiểm tra participants
        if (!Array.isArray(participantsList) || participantsList.length === 0) {
          notify(
            "Vui lòng thêm ít nhất một thành viên tổ chức trước khi gửi duyệt",
            "warning"
          );
          return;
        }

        // Kiểm tra phải có đủ 3 role bắt buộc: Trưởng ban tổ chức, Thành viên ban tổ chức, Ban kiểm soát
        // Lọc bỏ VOTER trước khi kiểm tra
        const mapParticipants = participantsList.filter((p: any) => {
          const roleCode = p?.roleId?.roleCode || p?.role?.roleCode;
          return roleCode !== USER_ROLE.VOTER;
        });

        const roleCheck = checkRequiredRoles(mapParticipants);
        if (!roleCheck.isValid) {
          notify(
            `Vui lòng thêm đầy đủ các thành viên tổ chức bắt buộc: ${roleCheck.missingRoles.join(", ")}`,
            "warning"
          );
          return;
        }
      }

      // Tách voters import từ Excel (isImportedFromExcel: true) ra khỏi voters thông thường
      const importedVoters = votersList.filter(
        (v: any) => v.isImportedFromExcel === true
      );
      const normalVoters = votersList.filter(
        (v: any) => !v.isImportedFromExcel
      );

      let existingExcelDocument = null;
      try {
        const allDocuments =
          await ElectionDocumentService.getDocumentByElectionId(electionId);
        if (allDocuments && Array.isArray(allDocuments)) {
          existingExcelDocument = allDocuments.find(
            (doc: any) =>
              doc.type === "voters-import-excel" ||
              (doc.fileUrl && doc.fileUrl.includes("voters-import-excel"))
          );
        }
      } catch (error) {
        // Nếu không tìm thấy hoặc lỗi, coi như chưa có document
        console.log("No existing Excel document found or error:", error);
      }

      // Xử lý document dựa trên số lượng voters import
      if (importedVoters.length > 0) {
        // Có voters import: Tạo file Excel mới và update/create document
        try {
          // 1. Tạo file Excel từ danh sách voters import
          const excelData = [
            ["FullName", "Email", "Phone", "CitizenId", "Shares"], // Header
            ...importedVoters.map((voter: any) => [
              voter.fullName || "",
              voter.email || "",
              voter.phone || "",
              voter.citizenId || "",
              voter.percentage || "",
            ]),
          ];

          const ws = XLSX.utils.aoa_to_sheet(excelData);
          ws["!cols"] = [
            { wch: 25 }, // FullName
            { wch: 30 }, // Email
            { wch: 15 }, // Phone
            { wch: 15 }, // CitizenId
            { wch: 10 }, // Shares
          ];

          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Danh sách cử tri");

          const excelBuffer = XLSX.write(wb, {
            type: "array",
            bookType: "xlsx",
          });
          const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const fileName = `Danh_sach_cu_tri_import_${new Date().getTime()}.xlsx`;
          const excelFile = new File([blob], fileName, {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });

          // 2. Upload file Excel lên MinIO
          const formData = new FormData();
          formData.append("file", excelFile);
          formData.append("fileType", "voters-import-excel");
          const userId = localStorage.getItem("userId") || "";
          formData.append("userId", userId);

          const uploadResponse = await FileService.upfile(formData);
          if (uploadResponse && uploadResponse.key) {
            const totalPercentage = importedVoters.reduce(
              (sum: number, p: any) => sum + (Number(p.percentage) || 0),
              0
            );

            // 3. Nếu đã có document, update với file mới
            if (existingExcelDocument && existingExcelDocument._id) {
              const updateBody = {
                title: `Danh sách cử tri import - ${importedVoters.length} người`,
                content: `File Excel chứa danh sách ${importedVoters.length} cử tri được import thành công vào ngày ${formatDate(new Date())}`,
                fileUrl: uploadResponse.key,
                remarks: `File Excel được tạo tự động từ danh sách cử tri đã import. Tổng số cử tri: ${importedVoters.length}. Tổng cổ phần: ${totalPercentage}%`,
                type: "voters-import-excel",
                status: "PENDING",
              };

              await ElectionDocumentService.UpdateDocumentById(
                existingExcelDocument._id,
                updateBody
              );
            } else {
              // 4. Nếu chưa có document, tạo mới
              const documentBody = {
                electionId: electionId,
                title: `Danh sách cử tri import - ${importedVoters.length} người`,
                content: `File Excel chứa danh sách ${importedVoters.length} cử tri được import thành công vào ngày ${formatDate(new Date())}`,
                fileUrl: uploadResponse.key,
                remarks: `File Excel được tạo tự động từ danh sách cử tri đã import. Tổng số cử tri: ${importedVoters.length}. Tổng cổ phần: ${totalPercentage}%`,
                type: "voters-import-excel",
                status: "PENDING",
              };

              await ElectionDocumentService.CreateDocument(documentBody);
            }
          } else {
            throw new Error("Upload file failed");
          }
        } catch (error) {
          console.error(
            "Error creating and uploading voter Excel document:",
            error
          );
          notify(
            "Lỗi khi tạo file Excel cho cử tri import. Vui lòng thử lại.",
            "error"
          );
          throw error;
        }
      } else if (existingExcelDocument && existingExcelDocument._id) {
        // Không còn voters import nhưng đã có document: Xóa document
        try {
          await ElectionDocumentService.delete(existingExcelDocument._id);
          console.log(
            "Deleted Excel document because no imported voters remain"
          );
        } catch (error) {
          console.error("Error deleting Excel document:", error);
          // Không throw error để không block quá trình lưu nháp
          notify(
            "Lỗi khi xóa file Excel cũ. Vui lòng kiểm tra lại.",
            "warning"
          );
        }
      }

      // Chuẩn bị body tổng hợp
      // CHỈ GỬI VOTERS THÔNG THƯỜNG (KHÔNG BAO GỒM VOTERS IMPORT TỪ EXCEL)
      const bulkBody = {
        electionId: electionId,
        meetingInfo: {
          type: meetingInfo.type,
          threshold: meetingInfo.threshold,
          method: meetingInfo.method,
          location: meetingInfo.location,
          // Đảm bảo chuyển đổi dayjs thành ISO string đúng cách
          authorizationStart: meetingInfo.authorizationStart
            ? typeof meetingInfo.authorizationStart === "string"
              ? meetingInfo.authorizationStart
              : dayjs(meetingInfo.authorizationStart).toISOString()
            : null,
          authorizationEnd: meetingInfo.authorizationEnd
            ? typeof meetingInfo.authorizationEnd === "string"
              ? meetingInfo.authorizationEnd
              : dayjs(meetingInfo.authorizationEnd).toISOString()
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
              fileUrl: result.fileUrl,
            });
          }

          return result;
        }),

        // Lọc bỏ document Excel import (type "voters-import-excel" hoặc fileUrl chứa "voters-import-excel")
        // Vì document Excel import đã được xử lý riêng ở trên
        electionDocuments: documentsList
          .filter(
            (doc: any) =>
              doc.type !== "voters-import-excel" &&
              !(doc.fileUrl && doc.fileUrl.includes("voters-import-excel"))
          )
          .map((doc: any) => ({
            _id: doc._id, // Có _id nếu edit
            title: doc.title,
            content: doc.content || "",
            fileUrl: doc.fileUrl || "",
            remarks: doc.remarks || "",
          })),
        // CHỈ GỬI VOTERS THÔNG THƯỜNG, KHÔNG GỬI VOTERS IMPORT TỪ EXCEL
        voters: normalVoters.map((v: any) => ({
          _id: v._id,
          userId: v.userId,
          percentage: v.percentage,
        })),
        participants: participantsList
          .filter((p: any) => {
            // Lọc bỏ những participants không có đủ thông tin
            const roleId = getRoleId(p);
            const position = (p.roleName || p.position || "").trim();
            const isValid = roleId && position.length > 0 && p.userId;
            if (!isValid) {
              console.warn("Participant filtered out:", {
                p,
                roleId,
                position,
                userId: p.userId,
              });
            }
            return isValid;
          })
          .map((p: any) => {
            const roleId = getRoleId(p);
            const position = (p.roleName || p.position || "").trim();
            console.log("Mapping participant:", {
              _id: p._id,
              userId: p.userId,
              roleId,
              position,
              originalRoleId: p.roleId,
            });
            return {
              _id: p._id,
              userId: p.userId,
              roleId: roleId!,
              position,
            };
          }),
        isSubmitForApproval: isSubmitForApproval,
        hasDocuments: hasDocuments,
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
      const errorMessage =
        err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
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
          {(statusData === "WAIT_ENTER_DATA" || statusData === "REJECTED") && (
            <>
              <Button icon={<SaveOutlined />} onClick={handleSaveDraft}>
                Lưu nháp
              </Button>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSubmitAll}
              >
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
            disabled={
              !(statusData === "WAIT_ENTER_DATA" || statusData === "REJECTED")
            }
            electionId={electionId}
          />
        </div>
        <div className="meeting-right">
          <Attendees
            onChange={setAttendees}
            data={voter}
            disabled={
              !(statusData === "WAIT_ENTER_DATA" || statusData === "REJECTED")
            }
            organizationMembers={organization}
            electionId={electionId}
          />
          <Organization
            onChange={setOrganization}
            data={organization}
            disabled={
              !(statusData === "WAIT_ENTER_DATA" || statusData === "REJECTED")
            }
            attendeesList={attendees}
          />
          <AttachedDocuments
            onChange={setDocuments}
            initialDocuments={existingDocuments}
            disabled={
              !(statusData === "WAIT_ENTER_DATA" || statusData === "REJECTED")
            }
            electionId={electionId}
          />
        </div>
      </div>
    </div>
  );
};

export default DraftingDocuments;
