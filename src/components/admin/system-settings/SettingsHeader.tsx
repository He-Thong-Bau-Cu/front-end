import { Button, Card, Typography } from "antd";
import { SaveOutlined, UndoOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const SettingsHeader: React.FC = () => {
  return (
    <Card
      className="settings-header-card"
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        padding: "22px 36px",
        marginTop: 24,
        marginBottom: 20,
        background: "#fff",
      }}
    >
      <div className="settings-header-container">
        <div className="settings-header-text">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 26,
                lineHeight: "26px",
              }}
            >
              ⚙️
            </span>
            <Title
              level={4}
              style={{
                margin: 0,
                color: "#1f2937",
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              Cài đặt hệ thống
            </Title>
          </div>
          <Text
            type="secondary"
            style={{ fontSize: 13, marginTop: 4, display: "block" }}
          >
            Tùy chỉnh và cấu hình hệ thống bầu cử theo nhu cầu doanh nghiệp
          </Text>
        </div>

        <div className="settings-header-buttons">
          <Button
            icon={<SaveOutlined />}
            className="btn-save"
            >
            Lưu tất cả
          </Button>

          <Button
            icon={<UndoOutlined />}
            className="btn-reset"
            >
            Khôi phục mặc định
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SettingsHeader;
