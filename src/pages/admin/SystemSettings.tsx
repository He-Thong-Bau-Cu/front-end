import { useRef, useState } from "react";
import SettingsHeader from "@/components/admin/system-settings/SettingsHeader";
import SettingsTabs from "@/components/admin/system-settings/SettingsTabs";
import GeneralSettings, {
  GeneralSettingsHandle,
} from "@/components/admin/system-settings/SettingsGeneral";
import SettingsElectionTypes from "@/components/admin/system-settings/SettingsElectionTypes";
import "@/style/admin/SystemSettings.model.css";
import type { SystemSettingsGroup } from "@/types/SystemConfig.interface";

const SystemSettings: React.FC = () => {
  const [activeGroup, setActiveGroup] =
    useState<SystemSettingsGroup>("OVERVIEW");
  const generalRef = useRef<GeneralSettingsHandle>(null);

  const handleSaveAll = () => {
    if (activeGroup !== "ELECTION_TYPES") {
      generalRef.current?.refresh();
    }
  };

  const handleResetDefaults = () => {
    if (activeGroup !== "ELECTION_TYPES") {
      generalRef.current?.resetFilters();
    }
  };

  return (
    <div className="system-settings-page">
      <SettingsHeader
        onSaveAll={handleSaveAll}
        onResetDefaults={handleResetDefaults}
      />
      <SettingsTabs activeKey={activeGroup} onChange={setActiveGroup} />
      {activeGroup === "ELECTION_TYPES" ? (
        <SettingsElectionTypes activeGroup={activeGroup} />
      ) : (
        <GeneralSettings ref={generalRef} activeGroup={activeGroup} />
      )}
    </div>
  );
};

export default SystemSettings;
