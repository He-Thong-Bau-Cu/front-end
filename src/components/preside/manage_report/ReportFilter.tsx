import { Input, Button } from "antd";
import "../../../style/preside/Reports.model.css";
interface ReportFilterProps {
  searchValue: string;
  onSearch: (v: string) => void;
  activeTab: string;
  onTabChange: (v: string) => void;
}
const ReportFilter: React.FC<ReportFilterProps> = ({
  searchValue,
  onSearch,
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { label: "Tất cả", value: "" },
    { label: "Báo cáo xác thực", value: "verification" },
    { label: "Báo cáo bất bình thường", value: "abnormal" },
    { label: "Báo cáo lưu trữ", value: "audit" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        gap: 12,
        flexWrap: "nowrap",
        width: "100%",
      }}
    >
      {/* SEARCH BÊN TRÁI */}
      <Input.Search
        placeholder="Tìm kiếm báo cáo theo tiêu đề hoặc mô tả..."
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
        allowClear
        style={{
          width: 300,
          height: 36,  
        }}
        
      />

      {/* BUTTON FILTER BÊN PHẢI */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "nowrap",
          alignItems: "center",
        }}
      >
        {tabs.map((t) => (
          <Button
            key={t.value}
            type={activeTab === t.value ? "primary" : "default"}
            style={{
              height: 36,                                   // ⭐ SAME HEIGHT
              background: activeTab === t.value ? "#b7eb8f" : "#fff",
              borderColor: "#b7eb8f",
              color: activeTab === t.value ? "#000" : "#666",
              fontWeight: 500,
              borderRadius: 6,
              padding: "0 20px",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",                         // ⭐ Căn giữa text
            }}
            onClick={() => onTabChange(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>
    </div>
  );



};

export default ReportFilter;
