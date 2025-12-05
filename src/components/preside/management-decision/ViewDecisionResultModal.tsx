import React from "react";
import { Modal, Descriptions, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";

interface ResultItem {
  _id: string;
  votesCount: number;
  isFinal: boolean;
  entityId?: {
    title?: string;
  };
  electionId?: {
    decisionName?: string;
    decisionNumber?: string;
    title?: string;
    startDate?: string;
    endDate?: string;
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: ResultItem[] | undefined; // API trả về mảng
}

const ViewDecisionResultModal: React.FC<Props> = ({ open, onClose, data }) => {
  const election = data && data.length > 0 ? data[0].electionId : undefined;
  const columns: ColumnsType<ResultItem> = [
    {
      title: "Tên đề cử / dự án",
      dataIndex: ["entityId", "title"],
      key: "title",
      width: "45%",
      render: (_value, record) => (
        <strong>{record?.entityId?.title ?? "—"}</strong>
      ),
    },
    {
      title: "Tổng số phiếu",
      dataIndex: "votesCount",
      key: "votesCount",
      align: "center",
      render: (v) => (v !== undefined ? v.toLocaleString() : 0),
    },
    {
      title: "Kết quả",
      dataIndex: "isFinal",
      key: "isFinal",
      align: "center",
      render: (val) =>
        val ? <Tag color="green">Đạt</Tag> : <Tag color="red">Không đạt</Tag>,
    },
  ];

  return (
    <Modal
      title="📊 KẾT QUẢ BẦU CHỌN"
      open={open}
      onCancel={onClose}
      footer={null}
      width={750}
    >
      {!data || data.length === 0 ? (
        <p>Không có dữ liệu kết quả.</p>
      ) : (
        <>
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Tên nghị quyết">
              {election?.decisionName ?? "—"}
            </Descriptions.Item>

            <Descriptions.Item label="Số nghị quyết">
              {election?.decisionNumber ?? "—"}
            </Descriptions.Item>

            <Descriptions.Item label="Tên cuộc bầu chọn">
              {election?.title ?? "—"}
            </Descriptions.Item>

            <Descriptions.Item label="Thời gian">
              {election?.startDate
                ? new Date(election.startDate).toLocaleString()
                : "—"}{" "}
              →{" "}
              {election?.endDate
                ? new Date(election.endDate).toLocaleString()
                : "—"}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái">
              <Tag color="green">Đã đóng</Tag>
            </Descriptions.Item>
          </Descriptions>

          <h3 style={{ marginTop: 20 }}>Kết quả chi tiết</h3>

          <Table<ResultItem>
            columns={columns}
            dataSource={data}
            rowKey="_id"
            pagination={false}
            bordered
          />
        </>
      )}
    </Modal>
  );
};

export default ViewDecisionResultModal;
