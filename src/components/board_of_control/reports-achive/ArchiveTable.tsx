import React from "react";
import { Table, Tooltip,Pagination } from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { ReportArchiveItem } from "../../../types/ReportArchive.interface";
interface Props {
  data: ReportArchiveItem[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function ArchiveTable({
  data,
  total,
  currentPage,
  pageSize,
  onPageChange,
}: Props) {
  const columns = [
    { title: "MÃ LƯU TRỮ", dataIndex: "id", key: "id" },
    { title: "TÊN BÁO CÁO", dataIndex: "name", key: "name" },
    { title: "LOẠI", dataIndex: "type", key: "type" },
    { title: "SỰ KIỆN", dataIndex: "event", key: "event" },
    { title: "NGÀY LƯU TRỮ", dataIndex: "date", key: "date" },
    {
      title: "NGƯỜI KÝ",
      dataIndex: "signer",
      key: "signer",
      render: (text: string) => (
        <>
          <span className="ra-signer-icon">𝒩</span> {text}
        </>
      ),
    },
    {
      title: "HÀNH ĐỘNG",
      key: "actions",
      align: "center" as const,
      render: () => (
        <div className="ra-actions">
          <Tooltip title="Xem chi tiết">
            <EyeOutlined className="ra-icon" />
          </Tooltip>
          <Tooltip title="Tải xuống">
            <DownloadOutlined className="ra-icon" />
          </Tooltip>
          <Tooltip title="Lịch sử">
            <HistoryOutlined className="ra-icon" />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="ra-table-card">
      <div className="ra-result">
        Tìm thấy <b>{total}</b> kết quả
      </div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="id"
      />
      <div className="ra-pagination">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={onPageChange}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
}