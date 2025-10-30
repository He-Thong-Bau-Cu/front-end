import { Card, Typography } from "antd";
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined, FileOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { RecentReport } from "../../../types/ReportCenter.interface";
export default function ReportRecent({ recents }: { recents: RecentReport[] }) {
  const getFileIcon = (name: string) => {
    if (name.endsWith(".pdf")) return <FilePdfOutlined style={{ color: "#ff4d4f" }} />;
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) return <FileExcelOutlined style={{ color: "#52c41a" }} />;
    return <FileOutlined style={{ color: "#1677ff" }} />;
  };

  return (
    <Card bordered={false} className="rc-card rc-recent-card">
      <div className="rc-section-header">
        <h3 className="rc-section-title">
          <ClockCircleOutlined style={{ marginRight: 6, color: "#52c41a" }} /> Được tạo gần đây
        </h3>
        <a href="#" className="rc-link">Xem tất cả</a>
      </div>

      <div className="rc-recent-list">
        {recents.map((r, i) => (
          <div key={r.id} className="rc-recent-row">
            <div className="rc-recent-left">
              <div className="rc-recent-icon">{getFileIcon(r.name)}</div>
              <div className="rc-recent-info">
                <div className="rc-recent-name">{r.name}</div>
                <div className="rc-recent-desc">
                  Được tạo {r.timeAgo} bởi {r.createdBy}
                </div>
              </div>
            </div>
            <DownloadOutlined className="rc-download-icon" />
          </div>
        ))}
      </div>
    </Card>
  );
}