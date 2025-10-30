import { Button } from "antd";
import { IssueMode } from "../../../pages/head_of_the_organizing_comittee/CreateDelegateCardPage";

export default function ModeSelector({
  value,
  onChange,
}: {
  value: IssueMode;
  onChange: (v: IssueMode) => void;
}) {
  return (
    <div className="dc-opt-group">
      <Button
        className={`dc-opt-btn ${value === "bulk" ? "active" : ""}`}
        onClick={() => onChange("bulk")}
        block
      >
        Tạo hàng loạt (Tất cả)
      </Button>
      <Button
        className={`dc-opt-btn ${value === "single" ? "active" : ""}`}
        onClick={() => onChange("single")}
        block
      >
        Tạo cho cá nhân
      </Button>
    </div>
  );
}
