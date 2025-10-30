import { Card, Checkbox, Typography } from "antd";
import { UnorderedListOutlined } from "@ant-design/icons";
import "../../../style/head-of-the-organizing-committee/OrganizerDashboard.model.css";

const { Title, Text } = Typography;

type Variant = "checkbox" | "square";

export interface TaskItem {
  id: string;
  label: string;
  variant?: Variant;     // "checkbox" (mặc định) | "square"
  done?: boolean;        // với checkbox: đã tick | với square: gạch ngang
  squareColor?: string;  // màu ô vuông (khi variant = "square")
}

interface Props {
  tasks: TaskItem[];
}

export default function TaskAssignments({ tasks }: Props) {
  return (
    <Card className="elevated task-card" bodyStyle={{ padding: 0 }}>
      {/* Header */}
      <div className="task-header with-divider">
        <UnorderedListOutlined className="task-icon" />
        <Title level={5} className="task-title">Phân công Nhiệm vụ</Title>
      </div>

      {/* Body */}
      <div className="task-body">
        {tasks.map((t) => {
          const variant: Variant = t.variant || "checkbox";
          return (
            <div key={t.id} className="task-row">
              {variant === "checkbox" ? (
                <Checkbox className="task-checkbox">
                  <Text className="task-text">{t.label}</Text>
                </Checkbox>
              ) : (
                <div className="task-square-line">
                  <span
                    className="task-square"
                    style={{ background: t.squareColor || "#1677ff" }}
                    aria-hidden
                  />
                  <Text className={`task-text ${t.done ? "is-done" : ""}`}>
                    {t.label}
                  </Text>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
