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
  "DELETED": "Đã đóng",
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
  const [statusFilter, setStatusFilter] = useState<string>("Tất cả trạng thái");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Decision | null>(null);

  // Load danh sách decisions khi component mount
  useEffect(() => {
    loadDecisions(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload khi status filter thay đổi
  // Khi có filter status, load tất cả dữ liệu để filter ở client-side
  // Khi không có filter, load với pagination bình thường
  useEffect(() => {
    // Load lại dữ liệu khi filter thay đổi
    // Reset về trang 1 khi filter thay đổi
    setPagination(prev => ({ ...prev, current: 1 }));
    loadDecisions(1, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Reload khi search text thay đổi (với debounce)
  useEffect(() => {
    // Bỏ qua lần mount đầu tiên
    if (searchText === "" && statusFilter === "Tất cả trạng thái") {
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
      // Nếu có filter status, load tất cả dữ liệu (limit lớn) để filter ở client-side
      // Vì backend chưa hỗ trợ filter theo statusData
      const hasStatusFilter = statusFilter !== "Tất cả trạng thái";
      const loadPage = hasStatusFilter ? 1 : page;
      const loadLimit = hasStatusFilter ? 10000 : limit; // Load nhiều hơn khi có filter

      console.log("Loading decisions with params:", {
        page: loadPage,
        limit: loadLimit,
        textSearch: searchText,
        statusFilter,
        hasStatusFilter
      });

      const response = await DecisionService.getAllDecisions({
        page: loadPage,
        limit: loadLimit,
        textSearch: searchText.trim() || undefined,
        status: statusFilter 
      });

      console.log("API Response received:", response);
      console.log("Content items:", response.content);

      // Kiểm tra nếu không có dữ liệu
      if (!response.content || response.content.length === 0) {
        console.warn("No data received from API");
        setData([]);
        setPagination({
          current: 1,
          pageSize: limit,
          total: 0,
        });
        return;
      }


      console.log("Formatted decisions:", response.content);

      // Lưu dữ liệu vào state
      setData(response.content);

      // Cập nhật pagination
      // Nếu có filter status, pagination sẽ được tính trên filteredData (ở client-side)
      // Nếu không filter, dùng pagination từ server
      if (hasStatusFilter) {
        // Khi có filter, lưu tổng số từ server để biết có thể còn dữ liệu không
        // Pagination thực tế sẽ được tính trên filteredData
        setPagination({
          current: 1,
          pageSize: limit,
          total: response.totalItems, // Tổng số từ server
        });
      } else {
        // Không có filter, dùng pagination từ server
        setPagination({
          current: response.page,
          pageSize: response.limit,
          total: response.totalItems,
        });
      }

      console.log("Data state updated, total items:", response.content.length);
    } catch (error: any) {
      console.error("Error loading decisions:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        data: error.response?.data,
      });

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải danh sách quyết định. Vui lòng thử lại sau.";

      message.error(errorMessage);

      // Set empty data on error
      setData([]);
      setPagination({
        current: 1,
        pageSize: pagination.pageSize,
        total: 0,
      });
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
      };
       const apiData2: any = {
        decisionNumber: values.decisionNumber,
        decisionName: values.decisionName,
        title: values.decisionName,
        statusData: "WAIT_ENTER_DATA",
      };

      let response;
      if (isEdit && id) {
        response = await DecisionService.updateDecision(id, apiData);
        if (response.status === 200 && response.success) {
          message.success("Cập nhật nghị quyết thành công!");
        } else {
          message.error("Không thể cập nhật nghị quyết. Vui lòng thử lại.");
        }
      } else {
        response = await DecisionService.createDecision(apiData2);
        if (response.status === 201 && response.success) {
          message.success("Tạo nghị quyết thành công!");
        } else {
          message.error("Không thể tạo nghị quyết. Vui lòng thử lại.");
        }
      }

      setOpen(false);
      setEditMode(false);
      setEditingDecision(null);
      await loadDecisions(pagination.current, pagination.pageSize);
    } catch (error: any) {
      console.error(`Error ${isEdit ? "updating" : "creating"} decision:`, error);
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

      console.log("Decision detail from API:", decisionDetail);
      setViewDecisionData(decisionDetail);
    } catch (error: any) {
      console.error("Error loading decision details:", error);
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
  const handleTableChange = (page: number, pageSize: number) => {
    if (statusFilter !== "Tất cả trạng thái") {
      // Đang filter client-side, chỉ cập nhật pagination
      setPagination(prev => ({ ...prev, current: page, pageSize }));
    } else {
      // Không filter, gọi API với pagination mới
      loadDecisions(page, pageSize);
    }
  };

  // Hàm xuất Excel


  const handleExportExcel = async () => {
    try {
      message.loading({ content: "Đang xuất file Excel...", key: "export" });

      // 🔹 Lấy toàn bộ dữ liệu (không phân trang)
      const response = await DecisionService.getAllDecisions({
        page: 1,
        limit: pagination.total || 10000, // lấy tất cả
        status:
          statusFilter !== "Tất cả trạng thái"
            ? statusFilter === "Đã phê duyệt"
              ? "APPROVED_SIGNED"
              : statusFilter === "Chờ nhập dữ liệu"
                ? "WAIT_ENTER_DATA"
                : statusFilter === "Chờ duyệt"
                  ? "WAIT_APPROVAL"
                  : statusFilter === "Yêu cầu chỉnh sửa"
                    ? "REQUEST_EDIT"
                    : statusFilter === "Đã đóng"
                      ? "DELETED"
                      : undefined
            : undefined,
        textSearch: searchText?.trim() || undefined,
      });

      // 🔹 Kiểm tra dữ liệu phản hồi
      const data = response?.content;
      if (!data || !Array.isArray(data) || data.length === 0) {
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

      message.success({ content: "Xuất file Excel thành công!", key: "export" });
    } catch (error: any) {
      console.error("Error exporting Excel:", error);
      message.error({
        content: "Không thể xuất file Excel. Vui lòng thử lại.",
        key: "export",
      });
    }
  };


  const filteredData = useMemo(() => {
    if (statusFilter === "Tất cả trạng thái") {
      return data;
    }
    const expectedStatus = statusMap[statusFilter];
    if (!expectedStatus) {
      return data;
    }

    // So sánh với statusData trong item
    return data.filter((item) => {
      return item.statusData === expectedStatus || item.status === expectedStatus;
    });
  }, [data, statusFilter]);

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
                  : statusData === "DELETED"
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
          {record.statusData !== "DELETED" && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditDecision(record)}
            />
          )}
          {record.statusData !== "DELETED" && (
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
            onChange={setStatusFilter}
            style={{ width: 180 }}
          >
            <Option value="Tất cả trạng thái">Tất cả trạng thái</Option>
            <Option value="APPROVED_SIGNED">Đã phê duyệt</Option>
            <Option value="WAIT_ENTER_DATA">Chờ nhập dữ liệu</Option>
            <Option value="WAIT_APPROVAL">Chờ duyệt</Option>
            <Option value="REQUEST_EDIT">Yêu cầu chỉnh sửa</Option>
            <Option value="DELETED">Đã đóng</Option>
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
            dataSource={filteredData}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: statusFilter !== "Tất cả trạng thái"
                ? filteredData.length  // Khi filter, dùng tổng số sau khi filter
                : pagination.total,    // Khi không filter, dùng tổng từ server
              showSizeChanger: true,
              showTotal: (total) => {
                const filterText = statusFilter !== "Tất cả trạng thái"
                  ? ` (Lọc: ${statusFilter})`
                  : "";
                return `Tổng ${total} quyết định${filterText}`;
              },
              onChange: (page, pageSize) => {
                handleTableChange(page, pageSize);
              },
              onShowSizeChange: (current, size) => {
                handleTableChange(1, size);
              },
            }}
            bordered={false}
            className="decision-table"
            rowKey="_id"
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
            await DecisionService.updateDecision(selectedRecord._id, { statusData: "DELETED" });
            console.log("Delete Response:", re);
            if (re.status === 200 && re.success) {
              message.success("Xóa nghị quyết thành công!");
            } else {
              message.error("Không thể xóa nghị quyết. Vui lòng thử lại.");
            }
            await loadDecisions(pagination.current, pagination.pageSize);
          } catch (error) {
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
