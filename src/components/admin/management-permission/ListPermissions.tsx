import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
  BarChartOutlined,
  DownloadOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { Button, Card, Switch, Table, Tag, Typography, Input } from "antd";
import { TableProps } from "antd/lib";
import "../../../style/admin/ManagementPermission.model.css";

const { Text } = Typography;

type PermissionRecord = {
  key: number;
  name: string;
  desc: string;
  category: string;
  level: string;
  status: boolean;
  icon: React.ReactNode;
};

const ListPermissions = () => {
  const columns: TableProps<PermissionRecord>["columns"] = [
    {
      title: "QUYỀN HẠN",
      dataIndex: "name",
      key: "name",
      render: (_: string, record) => (
        <div className="permission-item">
          <div className="permission-icon">{record.icon}</div>
          <div>
            <Text strong style={{ fontSize: "14px" }}>
              {record.name}
            </Text>
            <div className="permission-desc">{record.desc}</div>
          </div>
        </div>
      ),
    },
    {
      title: "DANH MỤC",
      dataIndex: "category",
      key: "category",
      render: (cat) => {
        const colorMap: Record<string, string> = {
          "Hệ Thống": "red",
          "Bầu Cử": "orange",
          "Người Dùng": "blue",
          "Báo Cáo": "yellow",
          "Dữ Liệu": "purple",
        };
        return (
          <Tag
            color={colorMap[cat] || "default"}
            style={{ borderRadius: "12px", fontSize: "12px" }}
          >
            {cat}
          </Tag>
        );
      },
    },
    {
      title: "MỨC ĐỘ",
      dataIndex: "level",
      key: "level",
      render: (level) => {
        const colorMap: Record<string, string> = {
          "QUAN TRỌNG": "red",
          "CAO": "orange",
          "BÌNH THƯỜNG": "blue",
          "THẤP": "green",
        };
        return (
          <Tag
            color={colorMap[level] || "default"}
            style={{ borderRadius: "12px", fontSize: "12px" }}
          >
            {level}
          </Tag>
        );
      },
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (active) => (
        <Switch
          checked={active}
          style={{ backgroundColor: active ? "#52c41a" : "#d9d9d9" }}
        />
      ),
    },
    {
      title: "HÀNH ĐỘNG",
      key: "action",
      render: () => (
        <div className="permission-action">
          <Button type="text" icon={<EditOutlined />} style={{ color: "#52c41a" }} />
          <Button type="text" icon={<DeleteOutlined />} style={{ color: "#ff4d4f" }} />
        </div>
      ),
    },
  ];

  const data: PermissionRecord[] = [
    {
      key: 1,
      name: "Quản lý hệ thống",
      desc: "Toàn quyền quản lý và cấu hình hệ thống",
      category: "Hệ Thống",
      level: "QUAN TRỌNG",
      status: true,
      icon: (
        <div
          className="permission-icon-bg"
          style={{ backgroundColor: "#ff4d4f" }}
        >
          <SettingOutlined style={{ color: "white", fontSize: "12px" }} />
        </div>
      ),
    },
    {
      key: 2,
      name: "Tạo bầu cử",
      desc: "Tạo và quản lý cuộc bầu cử mới",
      category: "Bầu Cử",
      level: "CAO",
      status: true,
      icon: (
        <div
          className="permission-icon-bg"
          style={{ backgroundColor: "#13c2c2" }}
        >
          <CheckSquareOutlined style={{ color: "white", fontSize: "12px" }} />
        </div>
      ),
    },
    {
      key: 3,
      name: "Quản lý người dùng",
      desc: "Thêm, sửa, xóa người dùng và phân quyền",
      category: "Người Dùng",
      level: "QUAN TRỌNG",
      status: true,
      icon: (
        <div
          className="permission-icon-bg"
          style={{ backgroundColor: "#1890ff" }}
        >
          <UserOutlined style={{ color: "white", fontSize: "12px" }} />
        </div>
      ),
    },
    {
      key: 4,
      name: "Xem báo cáo",
      desc: "Truy cập và xem các báo cáo hệ thống",
      category: "Báo Cáo",
      level: "BÌNH THƯỜNG",
      status: true,
      icon: (
        <div
          className="permission-icon-bg"
          style={{ backgroundColor: "#faad14" }}
        >
          <BarChartOutlined style={{ color: "white", fontSize: "12px" }} />
        </div>
      ),
    },
    {
      key: 5,
      name: "Xuất dữ liệu",
      desc: "Xuất dữ liệu và kết quả bầu cử",
      category: "Dữ Liệu",
      level: "BÌNH THƯỜNG",
      status: true,
      icon: (
        <div
          className="permission-icon-bg"
          style={{ backgroundColor: "#722ed1" }}
        >
          <DownloadOutlined style={{ color: "white", fontSize: "12px" }} />
        </div>
      ),
    },
    {
      key: 6,
      name: "Bỏ phiếu",
      desc: "Tham gia bỏ phiếu trong cuộc bầu cử",
      category: "Bầu Cử",
      level: "THẤP",
      status: true,
      icon: (
        <div
          className="permission-icon-bg"
          style={{ backgroundColor: "#13c2c2" }}
        >
          <CheckSquareOutlined style={{ color: "white", fontSize: "12px" }} />
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "67.7% 31.8%",
        gap: "20px",
        width: "100%",
        alignItems: "stretch",
        marginTop: "12px",
        paddingRight: "8px",
        boxSizing: "border-box",
      }}
    >
      {/* DANH SÁCH QUYỀN HẠN */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(180deg, #b7f59f 0%, #a7f08c 100%)",
            padding: "16px 20px",
            height: "54px",
            borderBottom: "1px solid rgba(255,255,255,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 600,
            color: "#2f7a32",
            fontSize: "15px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            🔐 Danh sách quyền hạn
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Input
              placeholder="Tìm kiếm quyền hạn..."
              prefix={<SearchOutlined style={{ color: "#888" }} />}
              style={{
                width: "250px",
                borderRadius: "6px",
                height: "32px",
                background: "#fff",
                border: "1px solid #d9d9d9",
              }}
            />
            <Button
              style={{
                borderRadius: "6px",
                height: "32px",
                border: "1px solid #d9d9d9",
                background: "#fff",
                fontSize: "13px",
              }}
            >
              Hàng loạt
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{
                borderRadius: "6px",
                height: "32px",
                fontSize: "13px",
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
              }}
            >
              Thêm mới
            </Button>
          </div>
        </div>
  
        <Card
          bodyStyle={{ padding: 0 }}
          style={{
            flexGrow: 1,
            border: "none",
            borderRadius: "0 0 12px 12px",
            background: "#fff",
          }}
        >
          <Table<PermissionRecord>
            rowKey="key"
            columns={columns}
            dataSource={data}
            pagination={false}
            size="small"
          />
        </Card>
      </div>
  
      {/* CHI TIẾT QUYỀN HẠN */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "linear-gradient(180deg, #b7f59f 0%, #a7f08c 100%)",
            padding: "16px 20px",
            height: "54px",
            borderBottom: "1px solid rgba(255,255,255,0.6)",
            fontWeight: 600,
            color: "#2f7a32",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          📄 Chi tiết quyền hạn
        </div>
  
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            background: "#fff",
            padding: "40px 16px",
          }}
        >
          <span style={{ fontSize: "30px", marginBottom: "8px" }}>👈</span>
          <Typography.Text strong style={{ fontSize: "14px", color: "#2d2d2d" }}>
            Chọn một quyền hạn
          </Typography.Text>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "2px" }}>
            để xem chi tiết và chỉnh sửa
          </p>
        </div>
      </div>
    </div>
  );  
};

export default ListPermissions;
