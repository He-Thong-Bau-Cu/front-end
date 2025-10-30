import { Button } from "antd";
import { AccessMethod } from "../../../pages/head_of_the_organizing_comittee/CreateDelegateCardPage";

export default function AccessMethodSelector({
  value,
  onChange,
}: {
  value: AccessMethod;
  onChange: (v: AccessMethod) => void;
}) {
  return (
    <div className="dc-opt-group">
      <Button
        className={`dc-opt-btn ${value === "qr_pin" ? "active" : ""}`}
        onClick={() => onChange("qr_pin")}
        block
      >
        Mã QR & Mã PIN
      </Button>
      <Button
        className={`dc-opt-btn ${value === "qr_only" ? "active" : ""}`}
        onClick={() => onChange("qr_only")}
        block
      >
        Chỉ Mã QR
      </Button>
    </div>
  );
}
