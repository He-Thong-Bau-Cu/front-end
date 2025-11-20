import React, { useEffect, useState } from "react";
import { Checkbox, Button } from "antd";
import { SignatureInfo } from "../../../types/SystemAuditReport.interface";

interface ReportSignatureProps {
  info: SignatureInfo;
  onConfirm?: () => Promise<void> | void;
  loading?: boolean;
}

export default function ReportSignature({ info, onConfirm, loading }: ReportSignatureProps) {
  const [checked, setChecked] = useState(info.isConfirmed);

  useEffect(() => {
    setChecked(info.isConfirmed);
  }, [info.isConfirmed]);

  return (
    <section className="sar-section-wrap">
      <div className="sar-signature-card">
        <div className="sar-sign-header">Khu vực Xác thực & Ký số</div>

        <div className="sar-sign-desc">
          Sử dụng chứng thư số của <b>{info.signerName}</b> - {info.signerRole}
        </div>

        <div className="sar-sign-confirm">
          <Checkbox
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          >
            Tôi đã xem xét và xác nhận tính chính xác của báo cáo này.
          </Checkbox>
        </div>

        <div className="sar-sign-action">
          <Button
            type="primary"
            className="sar-sign-btn"
            disabled={!checked || info.isConfirmed}
            loading={loading}
            onClick={onConfirm}
          >
            {info.isConfirmed ? "Đã ký số" : "Ký số & Phê duyệt"}
          </Button>
        </div>
      </div>
    </section>
  );
}
