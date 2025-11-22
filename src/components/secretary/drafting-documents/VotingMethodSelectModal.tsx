import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  Table,
  Button,
  message,
  Input,
  Tag,
  Typography,
  Card,
} from "antd";
import { CheckOutlined, SearchOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { VotingMethods } from "@/types/VotingMethods.interface";
import VotingMethodsService from "@/services/VotingMethodsService";

const { Text } = Typography;

interface VotingMethodSelectModalProps {
  open: boolean;
  onCancel: () => void;
  onSelect: (methodId: string, methodName: string) => void;
  selectedMethodId?: string;
}

const VotingMethodSelectModal: React.FC<VotingMethodSelectModalProps> = ({
  open,
  onCancel,
  onSelect,
  selectedMethodId,
}) => {
  const [methods, setMethods] = useState<VotingMethods[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    if (open) {
      fetchMethods();
    }
  }, [open]);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const data = await VotingMethodsService.searchVotingMethod({});
      setMethods(data || []);
    } catch (error) {
      console.error("Error fetching voting methods:", error);
      message.error("Không thể tải danh sách hình thức bầu cử");
    } finally {
      setLoading(false);
    }
  };

  // Lọc methods theo search text
  const filteredMethods = useMemo(() => {
    if (!searchText.trim()) return methods;
    const search = searchText.toLowerCase().trim();
    return methods.filter((method) => {
      const name = (method.methodName || "").toLowerCase();
      const code = (method.methodCode || "").toLowerCase();
      const desc = (method.description || "").toLowerCase();
      return name.includes(search) || code.includes(search) || desc.includes(search);
    });
  }, [methods, searchText]);

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center" as const,
      render: (_: any, __: any, index: number) => (
        <Tag color="green" style={{ margin: 0, minWidth: 32, textAlign: "center" }}>
          {index + 1}
        </Tag>
      ),
    },
    {
      title: "Tên hình thức",
      dataIndex: "methodName",
      key: "methodName",
      width: 250,
      render: (text: string, record: VotingMethods) => (
        <div>
          <Text strong style={{ fontSize: 14, display: "block", marginBottom: 4 }}>
            {text}
          </Text>
          <Tag color="default" style={{ fontSize: 11 }}>
            {record.methodCode}
          </Tag>
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
        tooltip: {
          placement: "topLeft",
        },
      },
      render: (text: string) => (
        <div>
          {text ? (
            <Text type="secondary" style={{ fontSize: 13 }}>
              {text}
            </Text>
          ) : (
            <Text type="secondary" style={{ fontStyle: "italic", fontSize: 12 }}>
              Không có mô tả
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center" as const,
      render: (status: string) => (
        <Tag color={status === "ACTIVE" ? "green" : "default"}>
          {status === "ACTIVE" ? "Hoạt động" : status}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: any, record: VotingMethods) => (
        <Button
          type={selectedMethodId === record._id ? "default" : "primary"}
          icon={<CheckOutlined />}
          onClick={() => {
            onSelect(record._id, record.methodName);
            onCancel();
          }}
          disabled={selectedMethodId === record._id}
          style={{
            backgroundColor: selectedMethodId === record._id ? "#f0f0f0" : undefined,
            borderColor: selectedMethodId === record._id ? "#d9d9d9" : undefined,
          }}
        >
          {selectedMethodId === record._id ? "Đã chọn" : "Chọn"}
        </Button>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title={
        <div>
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            Chọn hình thức bầu cử
          </span>
          {selectedMethodId && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                <InfoCircleOutlined style={{ marginRight: 4 }} />
                Đã chọn: {methods.find((m) => m._id === selectedMethodId)?.methodName || ""}
              </Text>
            </div>
          )}
        </div>
      }
      onCancel={onCancel}
      footer={null}
      width={1000}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên, mã hoặc mô tả..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ width: "100%" }}
        />
      </div>

      {filteredMethods.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <SearchOutlined
              style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
            />
            <p style={{ color: "#999", margin: 0, fontSize: 14 }}>
              {searchText
                ? `Không tìm thấy hình thức nào phù hợp với "${searchText}"`
                : "Không có hình thức bầu cử nào"}
            </p>
            {searchText && (
              <Button
                type="link"
                onClick={() => setSearchText("")}
                style={{ marginTop: 8 }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Table
          columns={columns}
          dataSource={filteredMethods}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              searchText
                ? `${range[0]}-${range[1]} của ${total} kết quả (Tổng: ${methods.length})`
                : `${range[0]}-${range[1]} của ${total} hình thức`,
            pageSizeOptions: ["5", "10", "20", "50"],
          }}
          scroll={{ x: "max-content" }}
          rowClassName={(record) =>
            selectedMethodId === record._id ? "selected-row" : ""
          }
          locale={{
            emptyText: (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <SearchOutlined
                  style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                />
                <p style={{ color: "#999", margin: 0, fontSize: 14 }}>
                  Không tìm thấy kết quả
                </p>
              </div>
            ),
          }}
        />
      )}

      <style>{`
        .selected-row {
          background-color: #f6ffed !important;
        }
        .selected-row:hover {
          background-color: #d9f7be !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f5f5f5 !important;
        }
        .selected-row:hover > td {
          background-color: #d9f7be !important;
        }
      `}</style>
    </Modal>
  );
};

export default VotingMethodSelectModal;

