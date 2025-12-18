import { Button, message, Modal, Table, Tag, Tooltip } from "antd";
import React, { useRef, useState } from "react";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { Participant } from "@/types/Participants.interface";
import * as XLSX from "xlsx";
import { User } from "@/types/User.interface";
import {
  checkDuplicateInExcel,
  isValidateCitizenId,
  isValidEmail,
  isValidPhone,
} from "@/utils/validate";
import { useNotification } from "@/contexts/NotificationContext";

interface Props {
  disabled?: boolean;
  participants: any[];
  setParticipants: React.Dispatch<React.SetStateAction<any[]>>;
  organizationMembers: any[];
  onChange: (data: Participant[]) => void;
  users: User[];
  
}

const ExcelImport: React.FC<Props> = ({
  disabled = false,
  participants,
  setParticipants,
  organizationMembers,
  onChange,
  users,
  
}) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalFileRef = useRef<File | null>(null); // Lưu file Excel gốc để upload sau
  const { notify } = useNotification();
  const handleImportExcel = () => {
    if (disabled) {
      notify("Không thể import khi đang ở chế độ chỉ đọc", "warning");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng file
    const validExtensions = [".xlsx", ".xls"];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      notify("Vui lòng chọn file Excel (.xlsx hoặc .xls)", "error");
      return;
    }

    // Lưu file gốc để upload sau khi xác nhận import
    originalFileRef.current = file;

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          console.log("jsonData", jsonData);

          if (jsonData.length < 2) {
            notify("File Excel không có dữ liệu hoặc thiếu header", "error");
            return;
          }

          // Lấy header (dòng đầu tiên)
          const headers = (jsonData[0] as string[]).map((h: string) =>
            String(h).toLowerCase().trim()
          );

          // Tìm index của các cột cần thiết
          const fullnameIndex = headers.findIndex(
            (h) =>
              h.includes("fullname") ||
              h.includes("họ và tên") ||
              h.includes("họ tên") ||
              h.includes("tên")
          );
          const emailIndex = headers.findIndex(
            (h) => h.includes("email") || h.includes("mail")
          );
          const phoneIndex = headers.findIndex(
            (h) =>
              h.includes("phone") ||
              h.includes("sđt") ||
              h.includes("sdt") ||
              h.includes("điện thoại")
          );
          const citizenIdIndex = headers.findIndex(
            (h) =>
              h.includes("citizenid") ||
              h.includes("citizen id") ||
              h.includes("cmnd") ||
              h.includes("cccd") ||
              h.includes("căn cước")
          );
          const sharesIndex = headers.findIndex(
            (h) =>
              h.includes("shares") ||
              h.includes("cổ phần") ||
              h.includes("percentage") ||
              h.includes("% cổ phần") ||
              h.includes("%")
          );

          if (
            fullnameIndex === -1 ||
            emailIndex === -1 ||
            sharesIndex === -1 ||
            citizenIdIndex === -1 ||
            phoneIndex === -1
          ) {
            notify(
              "File Excel thiếu các cột bắt buộc: FullName, Email, Shares, CitizenId, Phone",
              "error"
            );
            return;
          }

          // Parse dữ liệu từ dòng thứ 2 trở đi
          const parsedData: any[] = [];
          const errors: string[] = [];

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];
            if (!row || row.length === 0) continue;

            const fullname = String(row[fullnameIndex] || "").trim();
            const email = String(row[emailIndex] || "").trim();
            const phone =
              phoneIndex !== -1 ? String(row[phoneIndex] || "").trim() : "";
            // Xử lý CitizenId - có thể là số hoặc chuỗi, cần giữ nguyên định dạng
            let citizenId = "";
            if (
              citizenIdIndex !== -1 &&
              row[citizenIdIndex] !== undefined &&
              row[citizenIdIndex] !== null
            ) {
              const citizenIdValue = row[citizenIdIndex];
              // Nếu là số (có thể bị Excel convert sang scientific notation), chuyển về string
              if (typeof citizenIdValue === "number") {
                // Kiểm tra xem có phải scientific notation không
                const strValue = citizenIdValue.toString();
                if (strValue.includes("e") || strValue.includes("E")) {
                  // Chuyển từ scientific notation về số nguyên (ví dụ: 5.48471E+12 -> 5484710000000)
                  const parts = strValue.toLowerCase().split("e");
                  const base = parseFloat(parts[0]);
                  const exponent = parseInt(parts[1]);
                  citizenId = String(Math.round(base * Math.pow(10, exponent)));
                } else {
                  // Nếu là số nguyên, chuyển về string và loại bỏ phần thập phân
                  citizenId = String(Math.round(citizenIdValue));
                }
              } else {
                citizenId = String(citizenIdValue).trim();
              }
            }
            const shares = row[sharesIndex];

            // Validate dữ liệu - nếu có lỗi thì thêm vào danh sách lỗi
            const rowErrors: string[] = [];

            if (!fullname) {
              rowErrors.push(`Dòng ${i + 1}: Thiếu họ tên`);
            }
            if (!email) {
              rowErrors.push(`Dòng ${i + 1}: Thiếu email`);
            } else {
              // Validate định dạng email
              const emailRegex = isValidEmail(email);
              if (!emailRegex) {
                rowErrors.push(`Dòng ${i + 1}: Email không hợp lệ (${email})`);
              }
            }
            if (!shares || isNaN(Number(shares))) {
              rowErrors.push(`Dòng ${i + 1}: Cổ phần không hợp lệ`);
            } else {
              const percentage = Number(shares);
              if (percentage <= 0 || percentage > 100) {
                rowErrors.push(
                  `Dòng ${i + 1}: Cổ phần phải từ 1-100% (giá trị: ${shares})`
                );
              }
            }
            if (phone && phone.length > 0) {
              // Validate số điện thoại nếu có
              const isValidatePhone = isValidPhone(phone);
              if (!isValidatePhone) {
                rowErrors.push(
                  `Dòng ${i + 1}: Số điện thoại không hợp lệ (${phone})`
                );
              }
            }
            if (citizenId && citizenId.length > 0) {
              // Validate CMND/CCCD nếu có (thường là 9 hoặc 12 chữ số)
              const citizenIdRegex = isValidateCitizenId(citizenId);
              if (!citizenIdRegex) {
                rowErrors.push(
                  `Dòng ${i + 1}: CMND/CCCD không hợp lệ (${citizenId})`
                );
              }
            }

            // Nếu có lỗi, thêm vào danh sách lỗi và bỏ qua dòng này
            if (rowErrors.length > 0) {
              errors.push(...rowErrors);
              continue;
            }

            // Tìm user theo email hoặc citizenId (không bắt buộc)
            let user = users.find(
              (u) => u.email?.toLowerCase() === email.toLowerCase()
            );
            if (!user && citizenId) {
              user = users.find((u) => u.citizenId === citizenId);
            }

            const percentage = Number(shares);
            parsedData.push({
              rowIndex: i + 1,
              fullname,
              email,
              phone,
              citizenId,
              percentage,
              userId: user?._id || null,
              user: user || null,
              error: null, // Không còn bắt buộc phải có user
            });
          }

          // Nếu có bất kỳ lỗi nào, không cho phép import
          if (errors.length > 0) {
            notify(
              `File Excel có ${errors.length} lỗi. Vui lòng sửa lại trước khi import:\n${errors.slice(0, 10).join("\n")}${errors.length > 10 ? `\n... và ${errors.length - 10} lỗi khác` : ""}`
            );
            console.error("Import errors:", errors);
            return; // Không cho phép import nếu có lỗi
          }

          if (parsedData.length === 0) {
            notify("Không có dữ liệu hợp lệ trong file Excel", "error");
            return;
          }

          // Hiển thị modal preview để user xác nhận
          setImportData(parsedData);
          setIsImportModalOpen(true);
        } catch (error) {
          console.error("Error parsing Excel:", error);
          notify(
            "Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file.",
            "error"
          );
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error reading file:", error);
      notify("Lỗi khi đọc file", "error");
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Reset file khi đóng modal mà không import
  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setImportData([]);
    originalFileRef.current = null; // Reset file khi đóng modal
  };

  // Hàm tạo file Excel từ danh sách voter đã import thành công
  // const createExcelFromVoters = (voters: any[]): File => {
  //   // Tạo dữ liệu cho Excel
  //   const excelData = [
  //     ["FullName", "Email", "Phone", "CitizenId", "Shares"], // Header
  //     ...voters.map((voter) => [
  //       voter.fullName || "",
  //       voter.email || "",
  //       voter.phone || "",
  //       voter.citizenId || "",
  //       voter.percentage || "",
  //     ]),
  //   ];

  //   // Tạo worksheet
  //   const ws = XLSX.utils.aoa_to_sheet(excelData);

  //   // Đặt độ rộng cột
  //   ws["!cols"] = [
  //     { wch: 25 }, // FullName
  //     { wch: 30 }, // Email
  //     { wch: 15 }, // Phone
  //     { wch: 15 }, // CitizenId
  //     { wch: 10 }, // Shares
  //   ];

  //   // Tạo workbook
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Danh sách cử tri");

  //   // Chuyển workbook thành binary string
  //   const excelBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

  //   // Tạo Blob từ buffer
  //   const blob = new Blob([excelBuffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });

  //   // Tạo File từ Blob
  //   const fileName = `Danh_sach_cu_tri_import_${new Date().getTime()}.xlsx`;
  //   return new File([blob], fileName, {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });
  // };

  // Hàm kiểm tra xem danh sách voter có khớp với file Excel gốc không
  const validateVotersMatchExcel = (
    voters: any[],
    originalExcelData: any[]
  ): { isValid: boolean; message: string } => {
    // So sánh số lượng
    if (voters.length !== originalExcelData.length) {
      return {
        isValid: false,
        message: `Số lượng cử tri không khớp: File Excel có ${originalExcelData.length} cử tri, nhưng chỉ import được ${voters.length} cử tri`,
      };
    }

    // So sánh từng voter theo email và citizenId
    const voterMap = new Map();
    voters.forEach((v) => {
      const key = `${v.email?.toLowerCase() || ""}_${v.citizenId || ""}`;
      voterMap.set(key, v);
    });

    const excelMap = new Map();
    originalExcelData.forEach((e) => {
      const key = `${e.email?.toLowerCase() || ""}_${e.citizenId || ""}`;
      excelMap.set(key, e);
    });

    // Kiểm tra tất cả voter trong Excel có trong danh sách import không
    for (const [key, excelItem] of excelMap.entries()) {
      if (!voterMap.has(key)) {
        return {
          isValid: false,
          message: `Cử tri ${excelItem.fullname || excelItem.email} không được import thành công`,
        };
      }
    }

    return { isValid: true, message: "Danh sách cử tri khớp với file Excel" };
  };

  const handleConfirmImport = async () => {
    //1. CHECK DUPLICATE TRONG EXCEL
  const { duplicateEmails, duplicateCitizenIds } =
    checkDuplicateInExcel(importData);

  if (duplicateEmails.length > 0 || duplicateCitizenIds.length > 0) {
    let message = "File Excel có cử tri trùng nhau:\n";

    duplicateEmails.forEach(([email, rows]) => {
      message += `- Email ${email} xuất hiện ở dòng ${rows.join(", ")}\n`;
    });

    duplicateCitizenIds.forEach(([citizenId, rows]) => {
      message += `- CitizenId ${citizenId} xuất hiện ở dòng ${rows.join(", ")}\n`;
    });

    notify(message, "error");
    return; 
  }


    // Tất cả dữ liệu đã được validate trước đó, không cần lọc lỗi nữa
    const validData = importData.filter((item) => !item.error);

    if (validData.length === 0) {
      notify("Không có dữ liệu hợp lệ để import", "error");
      return;
    }

    //2. Kiểm tra trùng lặp với danh sách hiện tại (theo email hoặc citizenId)
    const existingEmails = new Set(
      participants.map((p) => p.email?.toLowerCase()).filter(Boolean)
    );
    const existingCitizenIds = new Set(
      participants.map((p) => p.citizenId).filter(Boolean)
    );
    const organizationEmails = new Set(
      organizationMembers.map((m) => m.email?.toLowerCase()).filter(Boolean)
    );
    const organizationCitizenIds = new Set(
      organizationMembers.map((m) => m.citizenId).filter(Boolean)
    );

    // Lọc bỏ các cử tri trùng lặp - CHỈ LẤY NHỮNG VOTER MỚI (CHƯA CÓ TRONG DANH SÁCH)
    const newVotersData = validData.filter((item) => {
      const emailLower = item.email?.toLowerCase();
      return (
        !(emailLower && existingEmails.has(emailLower)) &&
        !(item.citizenId && existingCitizenIds.has(item.citizenId)) &&
        !(emailLower && organizationEmails.has(emailLower)) &&
        !(item.citizenId && organizationCitizenIds.has(item.citizenId))
      );
    });

    // Kiểm tra xem có voter nào mới không
    if (newVotersData.length === 0) {
      notify(
        "Tất cả cử tri đã tồn tại trong danh sách. Không có cử tri nào được import.",
        "warning"
      );
      setIsImportModalOpen(false);
      setImportData([]);
      return;
    }

    //3. Kiểm tra tổng % cổ phần - CHỈ TÍNH CHO NHỮNG VOTER MỚI (KHÔNG DUPLICATE)
    const currentTotal = participants.reduce(
      (sum, p) => sum + (Number(p.percentage) || 0),
      0
    );
    const importTotal = newVotersData.reduce(
      (sum, item) => sum + (Number(item.percentage) || 0),
      0
    );
    const newTotal = currentTotal + importTotal;

    if (newTotal > 100) {
      notify(
        `Tổng cổ phần sẽ vượt quá 100%! (Hiện tại: ${currentTotal}%, Import: ${importTotal}% = ${newTotal}%)`,
        "error"
      );
      return;
    }

    // Thông báo số lượng voter duplicate (nếu có)
    const duplicateCount = validData.length - newVotersData.length;
    if (duplicateCount > 0) {
      notify(
        `Có ${duplicateCount} cử tri đã tồn tại trong danh sách. Chỉ import ${newVotersData.length} cử tri mới.`,
        "warning"
      );
    }

    // Map sang format participants - CHỈ MAP NHỮNG VOTER MỚI
    const newParticipants = newVotersData.map((item) => {
      const user = item.user;
      return {
        id: Date.now() + Math.random(),
        userId: item.userId || undefined, // Optional vì có thể không có user
        fullName: user?.fullName || item.fullname,
        email: user?.email || item.email,
        position: user?.position || "",
        status: user?.status || "PENDING",
        phone: user?.phone || item.phone || "",
        citizenId: user?.citizenId || item.citizenId || "",
        address: user?.address || "",
        department: user?.department || "",
        percentage: item.percentage,
        isImportedFromExcel: true, // Đánh dấu voter được import từ Excel
      };
    });

    // Kiểm tra xem danh sách voter mới có khớp với file Excel gốc không
    // (Chỉ validate những voter mới, không validate những voter duplicate)
    const validationResult = validateVotersMatchExcel(
      newParticipants,
      newVotersData
    );
    if (!validationResult.isValid) {
      notify(validationResult.message, "warning");
      // Vẫn cho phép import nhưng cảnh báo
    }

    // Thêm vào danh sách
    const updated = [...participants, ...newParticipants];
    setParticipants(updated);
    onChange(updated);

    notify(
      `Đã import thành công ${newParticipants.length} cử tri từ file Excel. File Excel sẽ được tạo khi bạn click "Lưu nháp" hoặc "Gửi duyệt"`,
      "success"
    );
    setIsImportModalOpen(false);
    setImportData([]);
    originalFileRef.current = null; // Reset file sau khi import xong
  };

  const handleDownloadTemplate = () => {
    // Tạo template Excel
    const templateData = [
      ["FullName", "Email", "Phone", "CitizenId", "Shares"],
      ["Lan Nguyen", "lan010603@gmail.com", "0328126702", "034303008552", "25"],
      ["Lina Nguyen", "kimquy001623@gmail.com","0328126609", "034303008553", "30"],
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh sách cử tri");

    // Đặt độ rộng cột
    ws["!cols"] = [
      { wch: 20 }, // FullName
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 15 }, // CitizenId
      { wch: 10 }, // Shares
    ];

    XLSX.writeFile(wb, "ban_mau_danh_sach_cu_tri.xlsx");
    notify("Đã tải bản mẫu thành công", "success");
  };
  return (
    <>
      {/* import by excel */}
      <Tooltip title="Nhập từ file Excel">
        <Button
          type="default"
          size="small"
          icon={<UploadOutlined />}
          onClick={handleImportExcel}
          disabled={disabled}
        />
      </Tooltip>
      {/* download template */}
      <Tooltip title="Tải xuống bản mẫu">
        <Button
          type="default"
          size="small"
          icon={<DownloadOutlined />}
          onClick={handleDownloadTemplate}
          disabled={disabled}
        />
      </Tooltip>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      {/* ==================== MODAL PREVIEW IMPORT ==================== */}
      <Modal
        title={
          <>
            <UploadOutlined style={{ marginRight: 8 }} />
            Xem trước dữ liệu import ({importData.length} dòng)
          </>
        }
        open={isImportModalOpen}
        onCancel={handleCloseImportModal}
        footer={[
          <Button key="cancel" onClick={handleCloseImportModal}>
            Hủy
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirmImport}
            disabled={disabled}
          >
            Xác nhận import
          </Button>,
        ]}
        centered
        width={900}
        styles={{
          body: {
            maxHeight: "70vh",
            overflowY: "auto",
            padding: "20px 24px",
          },
        }}
      >
        <Table
          dataSource={importData}
          rowKey={(record, index) => `import-${index}`}
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: "Dòng",
              dataIndex: "rowIndex",
              width: 60,
            },
            {
              title: "Họ tên",
              dataIndex: "fullname",
              width: 150,
            },
            {
              title: "Email",
              dataIndex: "email",
              width: 200,
            },
            {
              title: "SĐT",
              dataIndex: "phone",
              width: 120,
            },
            {
              title: "CMND/CCCD",
              dataIndex: "citizenId",
              width: 120,
            },
            {
              title: "% Cổ phần",
              dataIndex: "percentage",
              width: 100,
              render: (value) => `${value}%`,
            },
            {
              title: "Trạng thái",
              width: 200,
              render: (_, record) => {
                if (record.error) {
                  return <Tag color="red">{record.error}</Tag>;
                }
                const emailLower = record.email?.toLowerCase();
                const isDuplicate = participants.some(
                  (p) =>
                    p.email?.toLowerCase() === emailLower ||
                    (record.citizenId && p.citizenId === record.citizenId)
                );
                const isInOrganization = organizationMembers.some(
                  (m) =>
                    m.email?.toLowerCase() === emailLower ||
                    (record.citizenId && m.citizenId === record.citizenId)
                );
                if (isDuplicate) {
                  return <Tag color="orange">Đã tồn tại trong danh sách</Tag>;
                }
                if (isInOrganization) {
                  return (
                    <Tag color="orange">
                      Đã tồn tại trong thành viên tổ chức
                    </Tag>
                  );
                }
                // Nếu có user trong hệ thống
                if (record.userId) {
                  return <Tag color="blue">Có tài khoản - Sẵn sàng import</Tag>;
                }
                // Nếu không có user, vẫn cho phép import
                return <Tag color="green">Mới - Sẵn sàng import</Tag>;
              },
            },
          ]}
        />
        <div style={{ marginTop: 16, color: "#666", fontSize: 12 }}>
          <p>
            <strong>Lưu ý:</strong>
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>Các dòng có lỗi (màu đỏ) sẽ không được import</li>
            <li>Các cử tri đã tồn tại sẽ được bỏ qua</li>
            <li>Tổng cổ phần sau khi import không được vượt quá 100%</li>
          </ul>
        </div>
      </Modal>
    </>
  );
};

export default ExcelImport;
