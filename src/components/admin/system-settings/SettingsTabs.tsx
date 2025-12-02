import { Button } from "antd";
import {
  HomeOutlined,
  BellOutlined,
  SafetyOutlined,
  LinkOutlined,
  RocketOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import type { SystemSettingsGroup } from "@/types/SystemConfig.interface";

interface SettingsTabsProps {
  activeKey: SystemSettingsGroup;
  onChange: (key: SystemSettingsGroup) => void;
}

const tabs: { id: SystemSettingsGroup; icon: React.ReactNode; label: string }[] =
  [
    { id: "OVERVIEW", icon: <HomeOutlined />, label: "Tổng quan" },
    { id: "NOTIFY", icon: <BellOutlined />, label: "Thông báo" },
    { id: "SECURITY", icon: <SafetyOutlined />, label: "Bảo mật" },
    { id: "INTEGRATION", icon: <LinkOutlined />, label: "Tích hợp" },
    { id: "ADVANCED", icon: <RocketOutlined />, label: "Nâng cao" },
    { id: "ELECTION_TYPES", icon: <AppstoreOutlined />, label: "Thể loại bầu cử" },
  ];

const SettingsTabs = ({ activeKey, onChange }: SettingsTabsProps) => {
  return (
    <div className="settings-tabs-card">
      <div className="tabs-row">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            type="text"
            className={`tab-pill ${activeKey === tab.id ? "tab-pill--active" : ""}`}
            icon={tab.icon}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SettingsTabs;
