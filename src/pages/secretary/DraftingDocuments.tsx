import { useState } from "react";
import { Button, Space, message } from "antd";
import "../../style/secretary/DraftingDocuments.model.css";

import MeetingInfo from "@/components/secretary/drafting-documents/MeetingInfo";
import Attendees from "@/components/secretary/drafting-documents/Attendees";
import Organization from "@/components/secretary/drafting-documents/Organization";
import AttachedDocuments from "@/components/secretary/drafting-documents/AttachedDocuments";

const DraftingDocuments: React.FC = () => {
  /** -----------------------------
   *  STATE QUẢN LÝ MEETING INFO
   *  ----------------------------- */
  const [open, setOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>({
    meetingName: "Đại hội đồng cổ đông thường niên năm 2025",
    meetingDate: "2025-03-12",
    location: "Phòng họp A - Trụ sở chính",
  });

  /** -----------------------------
   *  HÀM XỬ LÝ
   *  ----------------------------- */

  const handleCloseMeeting = () => {
    setOpen(false);
    message.info("Đã đóng thông tin cuộc họp.");
  };

  const handleSignMeeting = async () => {
    try {
      setLoading(true);
      // 🟢 Giả lập ký số / lưu dữ liệu
      await new Promise((resolve) => setTimeout(resolve, 1500));
      message.success("Đã ký số thành công cho biên bản cuộc họp!");
    } catch (error) {
      message.error("Ký số thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="meeting-container">
      {/* ====== HEADER ====== */}
      <div className="meeting-header">

        <h2>Soạn thảo tài liệu bầu cử</h2>

        <Space>
          <Button onClick={() => message.info("Đã lưu bản nháp.")}>💾 Lưu nháp</Button>
          <Button
            type="primary"
            onClick={() => message.success("Tài liệu đã được gửi duyệt!")}
          >
            📤 Gửi duyệt
          </Button>
        </Space>
      </div>

      {/* ====== CONTENT ====== */}
      <div className="meeting-content">
        <div className="meeting-left">
          <MeetingInfo
            open={open}
            onClose={handleCloseMeeting}
            onSign={handleSignMeeting}
            data={data}
            loading={loading}
          />
        </div>

        <div className="meeting-right">
          <Attendees />
          <Organization />
          <AttachedDocuments />
        </div>
      </div> 
     </div>
  );
};

export default DraftingDocuments;
