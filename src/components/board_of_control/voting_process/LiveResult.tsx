import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import BallotService from "@/services/BallotService";
import { Ballot } from "@/types/Ballot.interface";
import { Card, Input, Select, Space, Table, Tag } from "antd";
import type { TableColumnsType } from "antd";
import "@/style/board-of-control/VotingProcess.model.css";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useEffect, useState } from "react";

dayjs.locale("vi");

export default function VotingProcess() {
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  const [ballots, setBallots] = useState<Ballot[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBallots = async () => {
      try {
        showLoading();

        const electionId = localStorage.getItem("currentElectionId");

        if (!electionId) {
          notify("Không tìm thấy electionId");
          return;
        }
        const data = await BallotService.getAllBallotsByElectionId(electionId);
        setBallots(data);
      } catch {
        notify("Không thể tải danh sách phiếu bầu của cử tri", "error");
      } finally {
        hideLoading();
      }
    };

    fetchBallots();
  }, []);

  const voters = ballots.map((b, index) => ({
    key: b._id || index,
    name: b.voterId?.userId?.fullName || "Không xác định",
    email: b.voterId?.userId?.email || "—",
    status: b.status,
    voteTime: b.castAt ? dayjs(b.castAt).format("HH:mm:ss - DD/MM/YYYY") : "--",
  }));

  const statusColorMap: Record<string, { color: string; label: string }> = {
    PENDING: { color: "gold", label: "Đang chờ" },
    CAST: { color: "green", label: "Đã bỏ phiếu" },
    LOCKED: { color: "volcano", label: "Đã khóa" },
    INVALID: { color: "volcano", label: "Không hợp lệ" },
    ACTIVE: { color: "cyan", label: "Hoạt động" },
    INACTIVE: { color: "default", label: "Ngừng hoạt động" },
  };

  const uniqueStatuses = Array.from(
    new Set(voters.map((v) => v.status?.toUpperCase()).filter(Boolean))
  ) as string[];

  const statusOptions = [
    { value: "ALL", label: "Tất cả" },
    ...uniqueStatuses.map((status) => {
      const config = statusColorMap[status] || { color: "default", label: status };
      return {
        value: status,
        label: config.label,
        color: config.color,
      };
    }),
  ];

  const normalizeText = (value?: string) =>
    value
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim() || "";

  const toLowerCase = (value?: string) => value?.toLowerCase() || "";

  const trimmedSearch = searchTerm.trim();
  const hasDiacritics = /[\u0300-\u036f]/.test(trimmedSearch.normalize("NFD"));
  const normalizedSearch = hasDiacritics
    ? trimmedSearch.toLowerCase()
    : normalizeText(trimmedSearch);

  const filteredVoters = voters.filter((voter) => {
    const matchesSearch =
      !trimmedSearch ||
      (hasDiacritics
        ? toLowerCase(voter.name).includes(normalizedSearch) ||
        toLowerCase(voter.email).includes(normalizedSearch)
        : normalizeText(voter.name).includes(normalizedSearch) ||
        normalizeText(voter.email).includes(normalizedSearch));

    const matchesStatus =
      !statusFilter || statusFilter === "ALL" || voter.status?.toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [trimmedSearch, statusFilter]);

  const pageSize = 5;
  const totalPages = Math.ceil(filteredVoters.length / pageSize) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const columns: TableColumnsType<(typeof voters)[number]> = [
    {
      title: "STT",
      key: "index",
      render: (_: unknown, __: (typeof voters)[number], index: number) =>
        index + 1 + pageSize * (currentPage - 1),
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng thái phiếu bầu",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const normalized = status?.toUpperCase?.() || "PENDING";
        const tag = statusColorMap[normalized] || statusColorMap["PENDING"];
        return <Tag color={tag.color}>{tag.label}</Tag>;
      },
    },
    {
      title: "Thời gian bỏ phiếu",
      dataIndex: "voteTime",
      key: "voteTime",
    },
  ];

  const paginationConfig =
    filteredVoters.length > pageSize
      ? {
        pageSize,
        current: currentPage,
        showSizeChanger: false,
        onChange: (page: number) => setCurrentPage(page),
      }
      : false;

  return (
    <Card
      title="📋 Trạng thái lá phiếu của các cử tri"
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
        padding: 8,
        background: "#ffffff",
      }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            width: "100%",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <Input.Search
            allowClear
            placeholder="Tìm theo tên hoặc email"
            style={{ flex: 1, maxWidth: "calc(100% - 220px)" }}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            size="large"
          />

          <Select
            allowClear
            options={statusOptions}
            placeholder="Lọc theo trạng thái"
            style={{ minWidth: 200 }}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            maxTagCount="responsive"
            size="large"
            optionRender={(option) => {
              if (option.value === "ALL") {
                return <span>{option.label}</span>;
              }
              const config = statusColorMap[option.value as string] || {
                color: "default",
                label: option.label,
              };
              return <Tag color={config.color}>{option.label}</Tag>;
            }}
            tagRender={(props) => {
              const { label, value, closable, onClose } = props;
              if (value === "ALL") {
                return (
                  <span
                    style={{
                      marginRight: 4,
                      padding: "2px 8px",
                      background: "#f0f0f0",
                      borderRadius: 4,
                    }}
                  >
                    {label}
                    {closable && (
                      <span
                        onClick={onClose}
                        style={{ marginLeft: 4, cursor: "pointer" }}
                      >
                        ×
                      </span>
                    )}
                  </span>
                );
              }
              const config = statusColorMap[value as string] || {
                color: "default",
                label: label,
              };
              return (
                <Tag
                  color={config.color}
                  closable={closable}
                  onClose={onClose}
                  style={{ marginRight: 4 }}
                >
                  {label}
                </Tag>
              );
            }}
          />
        </div>

        <Table<(typeof voters)[number]>
          className="live-result-table"
          columns={columns}
          dataSource={filteredVoters}
          pagination={paginationConfig}
          bordered
          style={{ borderRadius: 12 }}
        />
      </Space>
    </Card>
  );
}