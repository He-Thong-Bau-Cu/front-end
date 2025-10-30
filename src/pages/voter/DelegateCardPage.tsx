import React from "react";
import DelegateCard from "../../components/voter/delegate_card/DelegateCard";
import { Delegate } from "@/types/Delegate.interface"; // 👈 import interface

const DelegateCardPage = () => {
  const delegateData: Delegate = {
    session: "XVI",
    term: "Nhiệm kỳ: 2021–2026",
    name: "Nguyễn Văn A",
    avatarText: "NA",
    area: "Đại biểu Khu vực 1 - Quận 1, TP.HCM",
    status: "Đang hoạt động",
    id: "DB-QK-XVI-001-2024",
    issued: "Ngày cấp: 01/01/2024",
    dob: "15/06/1975",
    idNumber: "001234567890",
    email: "nguyenvana@quochoi.vn",
    phone: "0912 345 678",
    party: "Đảng Cộng sản Việt Nam",
    position: "Trưởng Ban Kinh tế",
    office: "Tầng 3, Nhà Quốc hội, Số 2 Hùng Vương, Ba Đình, Hà Nội",
    field: "Kinh tế tài chính - Ngành chính đầu tư phát triển",
    constituency: "17.850 cử tri tại Quận 1, TP Hồ Chí Minh",
  };

  return <DelegateCard delegate={delegateData} />;
};

export default DelegateCardPage;
