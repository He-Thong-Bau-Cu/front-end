import React, { useEffect, useState } from "react";
import { Modal, Typography, Spin, Button, Space, message, Card, Input } from "antd";
import "../../../style/preside/ViewDecision.model.css";
import { Decision } from "@/types/Decision.interface";
import DigitalSignModal from "@/components/voter/signdigitalBallot/DigitalSignModal";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import DecisionService from "@/services/DecisionService";
const { Text } = Typography;
interface MeetingInfo {
  open: boolean;
  onClose: () => void;
  onSign?: () => void;
  loading?: boolean;
}
const MeetingInfo: React.FC<MeetingInfo> = ({
  open,
  onClose,
  onSign,
  loading = false,
}) => {

  const [modalOpen, setModalOpen] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [data, setData] = useState<Decision | null>(null);
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    try {
      showLoading();
      const electionId = localStorage.getItem("currentElectionId");
      if (electionId) {
        const decision = await DecisionService.getElectionById(electionId);
        setData(decision)
      }

    } catch (error: any) {

    } finally {
      hideLoading();
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "......../......../..........";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  return (
    <Card title={<Text style={{ paddingLeft: 20, fontSize: 16 }}>📄 Nội dung Quyết định</Text>} className="decision-modal-wrapper">
      <div className="decision-modal-body">
        {/* ===== PAPER (A4) ===== */}
        <div className="decision-paper-a4">
          {/* ===== HEADER ===== */}
          <div className="paper-header">
            <div className="header-left">
              <Text className="company-name">
                CÔNG TY CỔ PHẦN PHÁT TRIỂN ĐIỆN LỰC VIỆT NAM
              </Text>
              <Text className="doc-number">
                Số: {data?.decisionNumber || "1632/QĐ-HĐQT"}
              </Text>
            </div>
            <div className="header-right">
              <Text className="nation">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </Text>
              <Text className="motto">Độc lập - Tự do - Hạnh phúc</Text>
              <Text className="location-date">
                Hà Nội, ngày {formatDate(data?.updatedAt)}
              </Text>
            </div>
          </div>

          {/* ===== TITLE ===== */}
          <div className="paper-title-section">
            <Text className="paper-title">QUYẾT ĐỊNH</Text>
            <Text className="paper-subtitle">
              Về việc {data?.decisionName}
            </Text>
            <Text className="paper-author">
              HỘI ĐỒNG QUẢN TRỊ CÔNG TY CỔ PHẦN PHÁT TRIỂN ĐIỆN LỰC VIỆT NAM
            </Text>
          </div>

          {/* ===== BODY ===== */}
          <div className="paper-body">
            <p>
              Căn cứ Luật Doanh nghiệp số 59/2020/QH14;
              <br />
              Căn cứ Điều lệ Công ty Cổ phần Phát triển Điện lực Việt Nam
              được ban hành theo Quyết định số 727/QĐ-HĐQT ngày 10/5/2023;
              <br />
              Căn cứ Quy chế nội bộ về quản trị được ban hành theo Quyết
              định số 729/QĐ-HĐQT ngày 10/5/2023;
              <br />
              Căn cứ Nghị quyết số 1497/NQ-HĐQT ngày 10/10/2023 của Hội đồng
              quản trị Công ty về việc triệu tập Đại hội đồng cổ đông bất
              thường năm 2023;
              <br />
              Căn cứ danh sách cổ đông được Tổng công ty Lưu ký và Bù trừ
              chứng khoán Việt Nam chốt ngày 31/10/2023.
            </p>

            <p className="decision-line">QUYẾT ĐỊNH:</p>

            <p>
              <strong>Điều 1.</strong> {data?.decisionName} của Công ty Cổ phần Phát triển Điện lực Việt
              Nam, chi tiết như sau:
            </p>
            <ul>
              <li>
                <b>1. Thời gian:</b>
                <Input
                  placeholder="................"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  bordered={false}
                  className="a4-input"
                />
              </li>
              <li>
                <b>2. Địa điểm:</b>
                <Input
                  placeholder="................"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  bordered={false}
                  className="a4-input"
                />
              </li>
              <li>
                <b>3. Hình thức tổ chức Đại hội:</b>
                <Input
                  placeholder="................"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  bordered={false}
                  className="a4-input"
                />
              </li>
              <li>
                <b>4. Loại hình bầu cử:</b>
                <Input
                  placeholder="................"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  bordered={false}
                  className="a4-input"
                />
              </li>
              <li>
                <b>5. Điều kiện thông qua:</b>
                <Input
                  placeholder="................"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  bordered={false}
                  className="a4-input"
                />
              </li>

              <li>
                <b>6. Nội dung Đại hội:</b> Được đính kèm theo Quyết định
                này;
              </li>
              <li>
                <b>7. Thành phần và thời điểm chốt danh sách cổ đông:</b>
                <Input
                  placeholder="................"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  bordered={false}
                  className="a4-input"
                />
              </li>
              <li>
                <b>8. Thời gian ủy quyền:</b>
                <Input
                  placeholder="................"
                  value={deadline} 
                  onChange={(e) => setDeadline(e.target.value)}
                  bordered={false}
                  className="a4-input"
                />
              </li>
            </ul>

            <p>
              <strong>Điều 2.</strong> Các thành viên HĐQT, Tổng Giám đốc
              Công ty, các đơn vị liên quan và cổ đông Công ty chịu trách
              nhiệm thi hành Quyết định này.
            </p>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="paper-footer">
            <div className="footer-left">
              <Text className="footer-heading">Nơi nhận:</Text>
              <ul>
                <li>Như Điều 2;</li>
                <li>PH (đăng web Cty);</li>
                <li>Lưu: VT, VP HĐQT.</li>
              </ul>
            </div>
            <div className="footer-right">
              <Text className="footer-company">
                TM. HỘI ĐỒNG QUẢN TRỊ
              </Text>
              <Text className="footer-role">CHỦ TỊCH</Text>
              <div className="footer-sign">(Đã ký)</div>
              <Text className="footer-name">Nguyễn Hoàng Đạo</Text>
            </div>
          </div>
        </div>

      </div>
    </Card>
  );
};

export default MeetingInfo;
