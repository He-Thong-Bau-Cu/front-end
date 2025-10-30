import { Typography } from "antd";
import { NotificationSectionData } from "../../../types/NotificationCenter.interface";
import NotificationItem from "./NotificationItem";

const { Text } = Typography;

export default function NotificationSection({
  section,
}: {
  section: NotificationSectionData;
}) {
  return (
    <div className="nc-section">
      <Text className="nc-section-title">{section.title}</Text>
      {section.items.map((item) => (
        <NotificationItem key={item.id} item={item} />
      ))}
    </div>
  );
}
