import { Button } from "antd";
import { CheckCircleOutlined, PrinterOutlined } from "@ant-design/icons";

const VerifyDelegateActions: React.FC = () => (
    <div className="verify-actions">
        <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{
                width: "100%",
                height: 45,
                borderRadius: 6,
                marginBottom: 12,
                background: "#27ae60",
            }}
        >
            Xác thực & Check-in Thủ công
        </Button>

        <Button
            icon={<PrinterOutlined />}
            style={{
                width: "100%",
                height: 45,
                borderRadius: 6,
            }}
        >
            In lại thẻ
        </Button>
    </div>
);

export default VerifyDelegateActions;
