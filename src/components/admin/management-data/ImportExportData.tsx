import { Card } from "antd";
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "@/style/admin/ManagementData.model.css";

const ImportExportData = () => {
  const actions = [
    {
      icon: <CloudUploadOutlined />,
      color: "#1677ff",
      title: "Chèn dữ liệu người dùng",
      desc: "Tải lên file Excel/CSV danh sách cử tri",
    },
    {
      icon: <CloudDownloadOutlined />,
      color: "#22c55e",
      title: "Xuất kết quả bầu cử",
      desc: "Xuất dữ liệu bầu cử ra file Excel",
    },
    {
      icon: <FileTextOutlined />,
      color: "#f59e0b",
      title: "Xuất báo cáo tổng hợp",
      desc: "Tạo báo cáo PDF chi tiết",
    },
  ];

  return (
    <Card
      className="import-export-card"
      style={{ padding: "20px 24px", borderRadius: 12 }}
      title={<span className="import-export-title" style={{fontSize: 22.5}}>📊 Chèn/Xuất dữ liệu</span>}
    >
      <div className="import-export-row">
        {actions.map((item, index) => (
          <div className="import-export-item" key={index}>
            <div className="icon-box">
              <span
                className="icon"
                style={{ color: item.color, fontSize: 73 }}
              >
                {item.icon}
              </span>
            </div>
            <div className="text" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", lineHeight: 1.4 }}>
              <strong>{item.title}</strong>
              <small>{item.desc}</small>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ImportExportData;
