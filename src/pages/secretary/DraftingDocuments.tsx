import { useState } from "react";
import { Button, Space, message } from "antd";
import "../../style/secretary/DraftingDocuments.model.css";
import MeetingInfo from "@/components/secretary/drafting-documents/MeetingInfo";
import Attendees from "@/components/secretary/drafting-documents/Attendees";
import Organization from "@/components/secretary/drafting-documents/Organization";
import AttachedDocuments from "@/components/secretary/drafting-documents/AttachedDocuments";

const DraftingDocuments: React.FC = () => {
  const [open, setOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmitMeeting = async (payload: any) => {
    console.log("📌 Dữ liệu nhận từ MeetingInfo:", payload);

    try {
      setLoading(true);

      // 🟢 Giả lập gửi dữ liệu lên server
      await new Promise((resolve) => setTimeout(resolve, 1500));

      message.success("Lưu thông tin cuộc họp thành công!");
    } catch (error) {
      message.error("Lưu thông tin không thành công!");
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
          <Button onClick={() => message.info("Đã lưu bản nháp.")}>
            💾 Lưu nháp
          </Button>
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
            onSubmit={handleSubmitMeeting}   // ⭐ ĐÚNG PROP MỚI
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
