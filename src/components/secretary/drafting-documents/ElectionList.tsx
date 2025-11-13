import {
  Card,
  Input,
  Button,
  Select,
  Table,
  Tag,
  Space,
  Typography,
  message,
  Spin,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  FileExcelOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import type { Decision } from "@/types/Decision.interface";
import DecisionService from "@/services/DecisionService";
import * as XLSX from "xlsx";
import { useNotification } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { Option } = Select;

// Hàm format ngày
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// Map status
const statusMap: { [key: string]: string } = {
  APPROVED_SIGNED: "Đã phê duyệt",
  WAIT_APPROVAL: "Chờ duyệt",
  REQUEST_EDIT: "Yêu cầu chỉnh sửa",
  WAIT_ENTER_DATA: "Chờ nhập dữ liệu",
  DRAFT: "Đã xóa",
};

const ElectionList = () => {
  const [data, setData] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    waiting: 0,
    editing: 0,
    entering: 0,
    draft: 0,
  });

  const navigate = useNavigate();
  const { notify } = useNotification();

  // Load dữ liệu
  useEffect(() => {
    loadDecisions(1, pagination.pageSize);
  }, [statusFilter, searchText]);

  const loadDecisions = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await DecisionService.getAllDecisions({
        page,
        limit,
        textSearch: searchText.trim() || undefined,
        statusData: statusFilter || undefined,
      });

      const items = response?.content || [];
      setData(items);
      setPagination({
        current: response.page || page,
        pageSize: response.limit || limit,
        total: response.totalItems || 0,
      });

      // 🔹 Thống kê trạng thái
      const counts = {
        total: response.totalItems || items.length,
        approved: items.filter((i: any) => i.statusData === "APPROVED_SIGNED").length,
        waiting: items.filter((i: any) => i.statusData === "WAIT_APPROVAL").length,
        editing: items.filter((i: any) => i.statusData === "REQUEST_EDIT").length,
        entering: items.filter((i: any) => i.statusData === "WAIT_ENTER_DATA").length,
        draft: items.filter((i: any) => i.statusData === "DRAFT").length,
      };
      setStats(counts);
    } catch (error: any) {
      message.error("Không thể tải danh sách nghị quyết.");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination({ ...pagination, current, pageSize });
    loadDecisions(current, pageSize);
  };

  const handleExportExcel = async () => {
    try {
      message.loading({ content: "Đang xuất file Excel...", key: "export" });
      const response = await DecisionService.getAllDecisions({
        page: 1,
        limit: pagination.total || 10000,
        statusData: statusFilter || undefined,
        textSearch: searchText?.trim() || undefined,
      });
      const data = response?.content || [];
      if (!data.length) {
        notify("Không có dữ liệu để xuất.", "warning");
        return;
      }
      const exportData = data.map((item: any, index: number) => ({
        STT: index + 1,
        "Số quyết định": item.decisionNumber,
        "Tên quyết định": item.decisionName,
        "Trạng thái": statusMap[item.statusData],
        "Ngày tạo": formatDate(item.createdAt),
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Nghị quyết");
      XLSX.writeFile(wb, "Danh_sach_nghi_quyet.xlsx");
      notify("Xuất file Excel thành công!", "success");
    } catch (error) {
      message.error("Không thể xuất file Excel.");
    }
  };

  const columns = [
    {
      title: "SỐ QUYẾT ĐỊNH",
      render: (record: Decision) => (
        <a style={{ color: "#1677ff", fontWeight: 500 }}>{record.decisionNumber}</a>
      ),
    },
    { title: "TÊN QUYẾT ĐỊNH", dataIndex: "decisionName" },
    {
      title: "TRẠNG THÁI",
      dataIndex: "statusData",
      render: (statusData: string) => {
        const color =
          statusData === "APPROVED_SIGNED"
            ? "green"
            : statusData === "WAIT_ENTER_DATA"
            ? "orange"
            : statusData === "WAIT_APPROVAL"
            ? "blue"
            : statusData === "REQUEST_EDIT"
            ? "yellow"
            : "red";
        return <Tag color={color}>{statusMap[statusData] || statusData}</Tag>;
      },
    },
    {
      title: "NGÀY TẠO",
      dataIndex: "createdAt",
      render: (date: Date | string) => formatDate(date) || "-",
    },
    {
      title: "THAO TÁC",
      render: (_: any, record: Decision) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate("/secretary/drafting-documents/drafting")}
          >
            Soạn thảo
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      className="decision-table-card"
      style={{ borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
    >
      {/* ====== PHẦN THỐNG KÊ ====== */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={4}>
          <Card bordered={false} style={{ background: "#f6ffed" }}>
            <Statistic
              title="Tổng số nghị quyết"
              value={stats.total}
              prefix={<FileTextOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false} style={{ background: "#e6f7ff" }}>
            <Statistic
              title="Chờ duyệt"
              value={stats.waiting}
              prefix={<ClockCircleOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false} style={{ background: "#f6ffed" }}>
            <Statistic
              title="Đã phê duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false} style={{ background: "#fffbe6" }}>
            <Statistic
              title="Chờ nhập dữ liệu"
              value={stats.entering}
              prefix={<ExclamationCircleOutlined style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false} style={{ background: "#f9f0ffff" }}>
            <Statistic
              title="Yêu cầu chỉnh sửa"
              value={stats.editing}
              prefix={<EditOutlined style={{ color: "#4e4e47ff" }} />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card bordered={false} style={{ background: "#fff0f6" }}>
            <Statistic
              title="Đã xóa"
              value={stats.draft}
              prefix={<StopOutlined style={{ color: "#dd5164ff" }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* ====== THANH TÌM KIẾM & HÀNH ĐỘNG ====== */}
      <div
        className="decision-toolbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <Input
          placeholder="Tìm kiếm theo số quyết định, kỳ bầu cử..."
          prefix={<SearchOutlined />}
          style={{ width: 320 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Space>
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            style={{ width: 200 }}
          >
            <Option value="">Tất cả trạng thái</Option>
            <Option value="APPROVED_SIGNED">Đã phê duyệt</Option>
            <Option value="WAIT_ENTER_DATA">Chờ nhập dữ liệu</Option>
            <Option value="WAIT_APPROVAL">Chờ duyệt</Option>
            <Option value="REQUEST_EDIT">Yêu cầu chỉnh sửa</Option>
            <Option value="DRAFT">Đã xóa</Option>
          </Select>
          <Button
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            style={{ background: "#52c41a", color: "#fff", border: "none" }}
          >
            Xuất Excel
          </Button>
        </Space>
      </div>

      {/* ====== BẢNG DỮ LIỆU ====== */}
      <Spin spinning={loading}>
        {data.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Text type="secondary">Không có dữ liệu nghị quyết nào</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="_id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} nghị quyết`,
            }}
            onChange={handleTableChange}
          />
        )}
      </Spin>
    </Card>
  );
};

export default ElectionList;
