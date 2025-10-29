import ReportCard from "./ReportCard";
import {
  BarChartOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserDeleteOutlined,
  EnvironmentOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "../../../style/preside/Reports.model.css";

const ReportList = ({ filter }) => {
  const allReports = [
    {
      key: 1,
      title: "Kết quả Bầu cử Chi tiết",
      desc: "Báo cáo toàn diện bao gồm số phiếu cho mỗi ứng viên, tỷ lệ phiếu hợp lệ và không hợp lệ.",
      icon: <BarChartOutlined />,
      type: "Kết quả",
    },
    {
      key: 2,
      title: "Báo cáo Tổng hợp Kết quả",
      desc: "Cung cấp một bản tóm tắt trực quan về biểu đồ kết quả cuối cùng của cuộc bầu cử.",
      icon: <PieChartOutlined />,
      type: "Kết quả",
    },
    {
      key: 3,
      title: "Danh sách Cử tri Tham gia",
      desc: "Xuất danh sách tất cả cử tri đã hoàn thành việc bỏ phiếu, kèm theo thông tin phòng ban và thời gian.",
      icon: <TeamOutlined />,
      type: "Cử tri",
    },
    {
      key: 4,
      title: "Danh sách Cử tri Vắng mặt",
      desc: "Liệt kê tất cả các cử tri đủ điều kiện nhưng đã không tham gia bỏ phiếu trong cuộc bầu cử.",
      icon: <UserDeleteOutlined />,
      type: "Cử tri",
    },
    {
      key: 5,
      title: "Thống kê Tham gia theo Đơn vị",
      desc: "Phân tích tỉ lệ cử tri tham gia giữa các phòng ban, chi nhánh hoặc khu vực khác nhau.",
      icon: <EnvironmentOutlined />,
      type: "Cử tri",
    },
    {
      key: 6,
      title: "Nhật ký Hoạt động Hệ thống",
      desc: "Báo cáo kiểm toán chi tiết, ghi lại các hành động quan trọng diễn ra trong hệ thống theo thời gian.",
      icon: <ReloadOutlined />,
      type: "Hệ thống",
    },
  ];

  const filtered =
    filter === "Tất cả"
      ? allReports
      : allReports.filter((r) => r.type === filter);

  return (
    <div className="report-grid">
      {filtered.map((r) => (
        <ReportCard
          key={r.key}
          icon={r.icon}
          title={r.title}
          description={r.desc}
        />
      ))}
    </div>
  );
};

export default ReportList;
