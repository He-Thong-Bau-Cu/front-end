import SettingsHeader from "@/components/admin/system-settings/SettingsHeader";
import SettingsTabs from "@/components/admin/system-settings/SettingsTabs";
import GeneralSettings from "@/components/admin/system-settings/SettingsGeneral";
import "@/style/admin/SystemSettings.model.css";

const SystemSettings: React.FC = () => {
  return (
    <div className="system-settings-page">
      <SettingsHeader />
      <SettingsTabs />
      <GeneralSettings />
    </div>
  );
};

export default SystemSettings;
