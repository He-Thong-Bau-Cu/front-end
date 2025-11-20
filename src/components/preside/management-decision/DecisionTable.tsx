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
  Modal,
} from "antd";
import {
  SearchOutlined,
  FileExcelOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useState, useEffect, useMemo } from "react";
import type { Decision } from "@/types/Decision.interface";
import CreateDecisionModal from "@/components/preside/management-decision/CreateDecisionModal";
import ViewDecisionModal from "@/components/preside/management-decision/ViewDecisionModal";
import DecisionService from "@/services/DecisionService";
import * as XLSX from "xlsx";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { useNotification } from "@/contexts/NotificationContext";
import ElectionParticipantsService from "@/services/ElectionParticipantsService";
const { Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
// Hàm format ngày chỉ hiển thị ngày/tháng/năm
const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return "";
  }
};

// Map status từ English sang tiếng Việt
const statusMap: { [key: string]: string } = {
  "APPROVED_SIGNED": "Đã phê duyệt",
  "WAIT_APPROVAL": "Chờ duyệt",
  "REQUEST_EDIT": "Yêu cầu chỉnh sửa",
  "WAIT_ENTER_DATA": "Chờ nhập dữ liệu",
  "DRAFT": "Đã xóa",
};
const DecisionTable = () => {

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDecisionData, setViewDecisionData] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [data, setData] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Decision | null>(null);
  const { notify } = useNotification();
  // Load danh sách decisions khi component mount
  useEffect(() => {
    loadDecisions(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchText]);

  useEffect(() => {
    // Bỏ qua lần mount đầu tiên
    if (searchText === "" && statusFilter === "") {
      return;
    }

    const timer = setTimeout(() => {
      loadDecisions(1, pagination.pageSize); // Reset về trang 1 khi search thay đổi
    }, 500); // Debounce 500ms cho search text

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const loadDecisions = async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    try {
      const response = await DecisionService.getAllDecisions({
        page,
        limit,
        textSearch: searchText.trim() || undefined,
        statusData: statusFilter || undefined,
      });

      setData(response?.content || []);
      setPagination({
        current: response.page || page,
        pageSize: response.limit || limit,
        total: response.totalItems || 0,
      });
    } catch (error: any) {
      message.error("Không thể tải danh sách nghị quyết.");
    } finally {
      setLoading(false);
    }
  };


  const handleCreateDecision = async (values: any, isEdit?: boolean, id?: string) => {
    try {
      setLoading(true);

      const apiData: any = {
        decisionNumber: values.decisionNumber,
        decisionName: values.decisionName,
        title: values.decisionName,
        startDate: values.startDate,
        endDate: values.endDate
      };
      const apiData2: any = {
        decisionNumber: values.decisionNumber,
        decisionName: values.decisionName,
        title: values.decisionName,
        statusData: "WAIT_ENTER_DATA",
        startDate: values.startDate,
        endDate: values.endDate
      };
      let response;
      let secretary;
      if (isEdit && id) {
        response = await DecisionService.updateDecision(id, apiData);
        if (response.status === 200 && response.success) {
          notify(response.message, "success");
          message.success("Cập nhật nghị quyết thành công!");
        } else {
          notify(response.message, "error");
          message.error("Không thể cập nhật nghị quyết. Vui lòng thử lại.");
        }
      } else {
        response = await DecisionService.createDecision(apiData2);

        const apiData3: any = {
          electionId: response.data?._id,
          userId: values.secretaryId,
          roleId: "6904d5f7105b6a336b819be5",
          position: "Thư ký chủ tọa",
          status: "ACTIVE"

        };
        secretary = await ElectionParticipantsService.createParticipant(apiData3);

        if (response.status === 201 && response.success) {
          notify(response.message, "success");
          message.success("Tạo nghị quyết thành công!");
        } else {
          notify(response.message, "error");
          message.error("Không thể tạo nghị quyết. Vui lòng thử lại.");
        }
      }

      setOpen(false);
      setEditMode(false);
      setEditingDecision(null);
      await loadDecisions(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
        `Không thể ${isEdit ? "cập nhật" : "tạo"} nghị quyết. Vui lòng thử lại.`
      );
    } finally {
      setLoading(false);
    }
  };


  const handleViewDecision = async (record: Decision) => {
    try {
      setViewLoading(true);
      setViewModalOpen(true);

      // Gọi API để lấy chi tiết decision
      const decisionDetail = await DecisionService.getElectionById(record._id);

      setViewDecisionData(decisionDetail);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Không thể tải chi tiết quyết định. Vui lòng thử lại.";
      message.error(errorMessage);
      setViewModalOpen(false);
      setViewDecisionData(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditDecision = async (record: Decision) => {
    try {
      setEditLoading(true);
      setEditMode(true);
      const decisionDetail = await DecisionService.getElectionById(record._id);
      setEditingDecision(decisionDetail);
      setOpen(true);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể tải dữ liệu chỉnh sửa.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle pagination change
  // Nếu đang filter, không gọi API mà chỉ thay đổi pagination state
  // Nếu không filter, gọi API với page và pageSize mới
  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    loadDecisions(current, pageSize); // ✅ luôn gọi API với statusFilter hiện tại
  };
  // Hàm xuất Excel


  const handleExportExcel = async () => {
    try {
      message.loading({ content: "Đang xuất file Excel...", key: "export" });

      // 🔹 Lấy toàn bộ dữ liệu (không phân trang)
      const response = await DecisionService.getAllDecisions({
        page: 1,
        limit: pagination.total || 10000, // lấy tất cả
        statusData: statusFilter || undefined,
        textSearch: searchText?.trim() || undefined,
      });

      // 🔹 Kiểm tra dữ liệu phản hồi
      const data = response?.content;
      if (!data || !Array.isArray(data) || data.length === 0) {
        notify("Không có dữ liệu để xuất.", "warning");
        message.warning({ content: "Không có dữ liệu để xuất.", key: "export" });
        return;
      }

      // 🔹 Chuẩn hóa dữ liệu xuất Excel
      const exportData = data.map((item: any, index: number) => ({
        STT: index + 1,
        "Số quyết định": item.decisionNumber || "",
        "Tên quyết định": item.decisionName || "",
        "Trạng thái": statusMap[item.status] || item.status || "",
        "Trạng thái dữ liệu": statusMap[item.statusData] || item.statusData || "",
        "Ngày bắt đầu ủy quyền": item.delegationStart
          ? formatDate(item.delegationStart)
          : "",
        "Ngày kết thúc ủy quyền": item.delegationEnd
          ? formatDate(item.delegationEnd)
          : "",
        "Ngày tạo": item.createdAt ? formatDate(item.createdAt) : "", // ✅ Sửa chính tả
        "Ngày bắt đầu": item.startDate ? formatDate(item.startDate) : "",
        "Ngày kết thúc": item.endDate ? formatDate(item.endDate) : "",
        "Loại bầu cử": item.typeId?.typeName || "",
        "Phương thức bầu cử": item.votingMethodId?.votingMethodName || "",
        "Người tạo": item.createdByUserId?.fullName || "",
      }));

      // 🔹 Tạo file Excel
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Danh sách nghị quyết");

      // 🔹 Cài đặt độ rộng cột
      const colWidths = [
        { wch: 5 }, // STT
        { wch: 20 },
        { wch: 40 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 25 },
        { wch: 25 },
        { wch: 25 },
      ];
      ws["!cols"] = colWidths;

      // 🔹 Ghi file ra local
      const fileName = `Danh_sach_nghi_quyet_${new Date()
        .toISOString()
        .split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      notify("Xuất file Excel thành công!", "success");
      message.success({ content: "Xuất file Excel thành công!", key: "export" });
    } catch (error: any) {
      notify("Không thể xuất file Excel. Vui lòng thử lại.", "error");
      message.error({
        content: "Không thể xuất file Excel. Vui lòng thử lại.",
        key: "export",
      });
    }
  };

  // Định nghĩa columns bên trong component để có thể sử dụng các hàm xử lý
  const columns = [
    {
      title: "SỐ QUYẾT ĐỊNH",
      decision_number: "SỐ QUYẾT ĐỊNH",
      decision_name: "TÊN QUYẾT ĐỊNH",
      render: (record: Decision) => (
        <>
          <a>{record.decisionNumber}</a>

        </>
      ),
    },
    { title: "TÊN QUYẾT ĐỊNH", dataIndex: "decisionName" },

    {
      title: "TRẠNG THÁI",
      dataIndex: "statusData", render: (statusData: string) => {
        const color =
          statusData === "APPROVED_SIGNED"
            ? "green"
            : statusData === "WAIT_ENTER_DATA"
              ? "orange"
              : statusData === "WAIT_APPROVAL"
                ? "yellow"
                : statusData === "REQUEST_EDIT"
                  ? "pink"
                  : statusData === "DRAFT"
                    ? "red"
                    : "gray";
        return <Tag color={color}>{statusMap[statusData] || statusData || "Chờ duyệt"}</Tag>;
      },
    },
    {
      title: "NGÀY TẠO",
      dataIndex: "createdAt",
      render: (date: Date | string) => formatDate(date) || "-"
    },
    {
      title: "THAO TÁC",
      render: (_: any, record: Decision) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDecision(record)}
          />
          {record.statusData !== "DRAFT" && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditDecision(record)}
            />
          )}
          {record.statusData !== "DRAFT" && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                setSelectedRecord(record);
                setOpenConfirm(true);
              }}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card className="decision-table-card">
      <div className="decision-toolbar">
        <Input
          placeholder="Tìm kiếm theo số quyết định, kỳ bầu cử..."
          prefix={<SearchOutlined />}
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <div className="decision-toolbar-actions">
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value); // ✅ Khi đổi, useEffect sẽ gọi lại API
              setPagination({ current: 1, pageSize: pagination.pageSize, total: pagination.total });
            }}
            style={{ width: 180 }}
          >
            <Option value="">Tất cả trạng thái</Option>
            <Option value="APPROVED_SIGNED">Đã phê duyệt</Option>
            <Option value="WAIT_ENTER_DATA">Chờ nhập dữ liệu</Option>
            <Option value="WAIT_APPROVAL">Chờ duyệt</Option>
            <Option value="REQUEST_EDIT">Yêu cầu chỉnh sửa</Option>
            <Option value="DRAFT">Đã xóa</Option>
          </Select>
          <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="btn-create"
            onClick={() => {
              setEditMode(false);
              setEditingDecision(null);
              setOpen(true);
            }}
          >
            Tạo quyết định mới
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        {data.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>Không có dữ liệu quyết định nào</p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={data}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} nghị quyết`,
            }}
            onChange={handleTableChange} // ✅ Table gửi object pagination đúng định dạng
          />

        )}
      </Spin>
      {/* 🧩 Modal tạo/chỉnh sửa nghị quyết */}
      <CreateDecisionModal
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditMode(false);
          setEditingDecision(null);
        }}
        onSubmit={handleCreateDecision}
        editMode={editMode}
        initialData={editingDecision}
      />

      {/* 🧩 Modal xem chi tiết quyết định */}
      <ViewDecisionModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewDecisionData(null);
        }}
        data={viewDecisionData}
        loading={viewLoading}
      />

      <ConfirmDeleteModal
        open={openConfirm}
        onCancel={() => setOpenConfirm(false)}
        onConfirm={async () => {
          if (!selectedRecord?._id) return;
          try {
            setLoading(true);
            const re = await DecisionService.deleteDecision(selectedRecord._id);
            await DecisionService.updateDecision(selectedRecord._id, { statusData: "DRAFT", status: "CANCEL" });
            if (re.status === 200 && re.success) {
              notify(re.message, "success");
              message.success("Xóa nghị quyết thành công!");
            } else {
              notify(re.message, "error");
              message.error("Không thể xóa nghị quyết. Vui lòng thử lại.");
            }
            await loadDecisions(pagination.current, pagination.pageSize);
          } catch (error) {
            notify("Không thể xóa nghị quyết. Vui lòng thử lại.", "error");
            message.error("Không thể xóa nghị quyết. Vui lòng thử lại.");
          } finally {
            setOpenConfirm(false);
            setLoading(false);
          }
        }}
      />

    </Card>
  );
};

export default DecisionTable;
