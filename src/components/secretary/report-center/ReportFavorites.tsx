import { Card} from "antd";
import { BarChartOutlined, UserOutlined, StarFilled } from "@ant-design/icons";
import { FavoriteReport } from "../../../types/ReportCenter.interface";

export default function ReportFavorites({ favorites }: { favorites: FavoriteReport[] }) {
  const getIcon = (title: string) => {
    if (title.toLowerCase().includes("hđqt")) return <BarChartOutlined />;
    if (title.toLowerCase().includes("tham gia")) return <UserOutlined />;
    return <StarFilled />;
  };

  return (
    <Card bordered={false} className="rc-card rc-fav-card">
      <div className="rc-section-header">
        <h3 className="rc-section-title">
          <StarFilled style={{ color: "#383837ff", marginRight: 6 }} /> Báo cáo yêu thích
        </h3>
        <a href="#" className="rc-link">Xem tất cả</a>
      </div>

      <div className="rc-fav-list">
        {favorites.map((f, index) => (
          <div key={f.id} className="rc-fav-row">
            <div className="rc-fav-icon">{getIcon(f.title)}</div>
            <div className="rc-fav-text">
              <div className="rc-fav-title">{f.title}</div>
              <div className="rc-fav-desc">{f.frequency}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}