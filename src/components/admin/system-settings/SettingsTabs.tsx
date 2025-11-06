import { Button } from "antd";
import {
  HomeOutlined,
  BellOutlined,
  SafetyOutlined,
  LinkOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const SettingsTabs = () => {
  const [active, setActive] = useState("overview");

  const TabBtn = ({
    id,
    icon,
    label,
  }: {
    id: string;
    icon: React.ReactNode;
    label: string;
  }) => (
    <Button
      type="text"
      className={`tab-pill ${active === id ? "tab-pill--active" : ""}`}
      icon={icon}
      onClick={() => setActive(id)}
    >
      {label}
    </Button>
  );

  return (
    <div className="settings-tabs-card">
      <div className="tabs-row">
        <TabBtn id="overview" icon={<HomeOutlined />} label="Tổng quan" />
        <TabBtn id="notify" icon={<BellOutlined />} label="Thông báo" />
        <TabBtn id="security" icon={<SafetyOutlined />} label="Bảo mật" />
        <TabBtn id="integration" icon={<LinkOutlined />} label="Tích hợp" />
        <TabBtn id="advanced" icon={<RocketOutlined />} label="Nâng cao" />
      </div>
    </div>
  );
};

export default SettingsTabs;
