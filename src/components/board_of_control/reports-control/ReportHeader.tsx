import React from "react";
import { Button, Space } from "antd";
import {
  DownloadOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { ReportInfo } from "../../../types/SystemAuditReport.interface";

export default function ReportHeader({ info }: { info: ReportInfo }) {
  return (
    <>
     

      {/* Main header card */}
      <div className="sar-headerCard">
        <h2 className="sar-headline">Báo cáo Kiểm soát Hệ thống</h2>
        <p className="sar-desc">
          Báo cáo này cung cấp thông tin tổng quan về các hoạt động và tình
          trạng an ninh của hệ thống trong kỳ.
        </p>

        <div className="sar-infogrid">
          <div>
            <div className="sar-infolabel">Mã báo cáo</div>
            <div className="sar-infovalue">{info.id}</div>
          </div>
          <div>
            <div className="sar-infolabel">Kỳ báo cáo</div>
            <div className="sar-infovalue">{info.reportPeriod}</div>
          </div>
          <div>
            <div className="sar-infolabel">Ngày tạo</div>
            <div className="sar-infovalue">{info.createdDate}</div>
          </div>
          <div>
            <div className="sar-infolabel">Trạng thái</div>
            <div className="sar-status-badge">{info.status}</div>
          </div>
        </div>
      </div>
    </>
  );
}
