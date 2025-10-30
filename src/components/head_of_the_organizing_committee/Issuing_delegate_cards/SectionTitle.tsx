import { Typography } from "antd";
const { Text } = Typography;

export default function SectionTitle({ index, title }: { index: number; title: string }) {
  return (
    <div className="dc-section-title">
      <span className="dc-section-index">{index}.</span>
      <Text className="dc-section-text">{title}</Text>
    </div>
  );
}
