import React, { useState } from "react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import VotingLayout from "../../components/voter/resolution_voting/VotingLayout";
import DigitalSignModal from "./DigitalSignModal";

const data = {
  title: "Nghị quyết phê duyệt Dự án Xây dựng Đường vành đai 3 TP.HCM",
  code: "HQ-15/2024/QH-16",
  date: "15/12/2024",
  intro:
    "Căn cứ Luật Tổ chức Quốc hội; Căn cứ Luật Đầu tư công; Xét đề nghị của Ủy ban Thường vụ Quốc hội...",
  clauses: [
    { title: "Điều 1.", content: "Phê duyệt chủ trương đầu tư dự án..." },
    { title: "Điều 2.", content: "Tổng mức đầu tư: 72.000 tỷ đồng..." },
    { title: "Điều 3.", content: "Thời gian thực hiện: 2025–2030 (5 năm)" },
    {
      title: "Điều 4.",
      content:
        "Giao Chính phủ, UBND TP.HCM tổ chức triển khai thực hiện theo quy định.",
    },
  ],
};

const options = [
  {
    key: "agree",
    label: "Tán thành",
    icon: <CheckCircleOutlined style={{ color: "#7cb342" }} />,
    description: "Tôi đồng ý với nội dung nghị quyết này",
    color: "#7cb342",
  },
  {
    key: "disagree",
    label: "Không tán thành",
    icon: <CloseCircleOutlined style={{ color: "#e53935" }} />,
    description: "Tôi không đồng ý với nội dung nghị quyết này",
    color: "#e53935",
  },
  {
    key: "neutral",
    label: "Không có ý kiến",
    icon: <MinusCircleOutlined style={{ color: "#ffa000" }} />,
    description: "Tôi giữ nguyên quan điểm, không tham gia biểu quyết",
    color: "#ffa000",
  },
];

export default function ResolutionVoting() {
  // ✅ Quản lý mở/đóng modal ký số
  const [openSignModal, setOpenSignModal] = useState(false);

  return (
    <>
      {/* Giao diện biểu quyết */}
      <VotingLayout
        title="Biểu quyết Nghị quyết"
        status="Đang biểu quyết"
        data={data}
        options={options}
        countdown={{ minutes: 45, seconds: "30" }}
        onSubmit={(choice, comment) => {
          console.log("Lựa chọn:", choice, "Ghi chú:", comment);
          setOpenSignModal(true); // 👈 Mở modal ký số sau khi ấn “Xác nhận biểu quyết”
        }}
      />

      {/* Modal ký số */}
      <DigitalSignModal
        open={openSignModal}
        onClose={() => setOpenSignModal(false)}
        onConfirm={() => {
          console.log("Đã ký số & gửi!");
          setOpenSignModal(false);
        }}
      />
    </>
  );
}
