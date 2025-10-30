import { Button, Space } from "antd";
import "./../../style/secretary/DraftingDocuments.model.css";
import MeetingInfo from "@/components/secretary/drafting-documents/MeetingInfo";
import AgendaSection from "@/components/secretary/drafting-documents/AgendaSection";
import Attendees from "@/components/secretary/drafting-documents/Attendees";
import Organization from "@/components/secretary/drafting-documents/Organization";
import AttachedDocuments from "@/components/secretary/drafting-documents/AttachedDocuments";

const DraftingDocuments: React.FC = () => {
  return (
    <div className="meeting-container">
      <div className="meeting-header">
        <h2>Chuẩn bị: Họp Hội đồng Quản trị Tháng 10</h2>
        <Space>
          <Button>💾 Lưu nháp</Button>
          <Button type="primary">📤 Gửi duyệt</Button>
        </Space>
      </div>

      <div className="meeting-content">
        <div className="meeting-left">
          <MeetingInfo />
          <AgendaSection />
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
