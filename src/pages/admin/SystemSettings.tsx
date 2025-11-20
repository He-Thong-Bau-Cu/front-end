import { useRef, useState } from "react";
import SettingsHeader from "@/components/admin/system-settings/SettingsHeader";
import SettingsTabs from "@/components/admin/system-settings/SettingsTabs";
import GeneralSettings, {
  GeneralSettingsHandle,
} from "@/components/admin/system-settings/SettingsGeneral";
import "@/style/admin/SystemSettings.model.css";
import type { SystemSettingsGroup } from "@/types/SystemConfig.interface";

const SystemSettings: React.FC = () => {
  const [activeGroup, setActiveGroup] =
    useState<SystemSettingsGroup>("OVERVIEW");
  const generalRef = useRef<GeneralSettingsHandle>(null);

  const handleSaveAll = () => {
    generalRef.current?.refresh();
  };

  const handleResetDefaults = () => {
    generalRef.current?.resetFilters();
  };

  return (
    <div className="system-settings-page">
      <SettingsHeader
        onSaveAll={handleSaveAll}
        onResetDefaults={handleResetDefaults}
      />
      <SettingsTabs activeKey={activeGroup} onChange={setActiveGroup} />
      <GeneralSettings ref={generalRef} activeGroup={activeGroup} />
    </div>
  );
};

export default SystemSettings;
