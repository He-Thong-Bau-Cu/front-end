import React, { useMemo } from "react";
import { Tabs, Table } from "antd";
import { ReportLogItem } from "../../../types/SystemAuditReport.interface";

export default function ReportTabs({ logs }: { logs: ReportLogItem[] }) {
  // === Định nghĩa nhóm hành động cho từng loại nhật ký ===
  const groupActions = {
    management: ["TẠO MỚI", "CẬP NHẬT", "XÓA DỮ LIỆU"],
    security: ["CẢNH BÁO", "BÁO CÁO"],
    data: ["KIỂM TRA", "ĐỒNG BỘ", "SAO LƯU"],
  };

  // === Lọc dữ liệu theo nhóm ===
  const managementLogs = useMemo(
    () => logs.filter((l) => groupActions.management.includes(l.action)),
    [logs]
  );
  const securityLogs = useMemo(
    () => logs.filter((l) => groupActions.security.includes(l.action)),
    [logs]
  );
  const dataLogs = useMemo(
    () => logs.filter((l) => groupActions.data.includes(l.action)),
    [logs]
  );

  // === Cấu hình cột bảng ===
  const columns = [
    { title: "THỜI GIAN", dataIndex: "time", key: "time" },
    { title: "NGƯỜI THỰC HIỆN", dataIndex: "user", key: "user" },
    { title: "HÀNH ĐỘNG", dataIndex: "action", key: "action" },
    { title: "MÔ TẢ CHI TIẾT", dataIndex: "details", key: "details" },
  ];

  return (
    <section className="sar-section-wrap">
      <div className="sar-section-header">Phân tích Chi tiết</div>

      <div className="sar-tabs-card">
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Nhật ký Hành động Quản trị",
              children: (
                <div className="sar-table-wrapper">
                  <Table
                    dataSource={managementLogs}
                    columns={columns}
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: false,
                      position: ["bottomRight"],
                    }}
                    rowKey="time"
                  />
                </div>
              ),
            },
            {
              key: "2",
              label: "Nhật ký An ninh",
              children: (
                <div className="sar-table-wrapper">
                  <Table
                    dataSource={securityLogs}
                    columns={columns}
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: false,
                      position: ["bottomRight"],
                    }}
                    rowKey="time"
                  />
                </div>
              ),
            },
            {
              key: "3",
              label: "Nhật ký Dữ liệu",
              children: (
                <div className="sar-table-wrapper">
                  <Table
                    dataSource={dataLogs}
                    columns={columns}
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: false,
                      position: ["bottomRight"],
                    }}
                    rowKey="time"
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
