import React, { useEffect, useState } from "react";
import { Card, Tag, Typography, message, Spin, Pagination, Button } from "antd";
import { CalendarOutlined, EyeOutlined } from "@ant-design/icons";
import DecisionService from "@/services/DecisionService";
import { Decision } from "@/types/Decision.interface";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import ViewDecisionModal from "../management-decision/ViewDecisionModal";
import ElectionDocumentService from "@/services/ElectionDocumentService";
import ElectionParticipantsService from "@/services/ElectionParticipantsService";
import ElectionEntitiesService from "@/services/ElectionEntitiesService";
import MeetingService from "@/services/MeetingService";

const { Text } = Typography;

const DecisionList: React.FC = () => {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [document, setDocument] = useState<any[]>([]);
  const [voters, setVoters] = useState<any[]>([]);
  const [organize, setOrganize] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [meeting, setMeeting] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDecisionData, setViewDecisionData] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // ✅ Gọi API lấy danh sách nghị quyết có trạng thái WAIT_APPROVAL
  const loadDecisions = async (page = pagination.current, limit = pagination.pageSize) => {
    try {
      showLoading();
      const response = await DecisionService.getAllDecisions({
        page,
        limit,
        statusData: "WAIT_APPROVAL",
      });

      // 🔹 Giả sử backend trả về { content, totalElements, page, size }
      setDecisions(response.content || []);
      setPagination((prev) => ({
        ...prev,
        current: response.page || page,
        pageSize: response.limit || limit,
        total: response.totalItems || response.totalItems || 0,
      }));
    } catch (error: any) {
      console.error("Error fetching WAIT_APPROVAL decisions:", error);
      message.error("Không thể tải danh sách nghị quyết chờ duyệt.");
    } finally {
      hideLoading();
    }
  };


  const handleViewDecision = async (record: Decision) => {
    try {
      setViewLoading(true);
      setViewModalOpen(true);
      const data1 = await ElectionDocumentService.getDocumentByElectionId(record._id);
      setDocument(data1);
      const data2 = await ElectionParticipantsService.getVoterByElectionId(record._id);
      setVoters(data2);
      const data3 = await ElectionEntitiesService.getElectionEntitiesByElectionId(record._id);
      setEntities(data3);
      const data4 = await ElectionParticipantsService.getByElectionId(record._id);
      setOrganize(data4);

      const data5 = await MeetingService.getByElectionId(record._id);
      setMeeting(data5)
      // Gọi API để lấy chi tiết decision
      const decisionDetail = await DecisionService.getElectionById(record._id);

      setViewDecisionData(decisionDetail.data);
    } catch (err: any) {
      notify(err.response?.data?.message, "error");
      setViewModalOpen(false);
      setViewDecisionData(null);
    } finally {
      setViewLoading(false);
    }
  };

  // 🔹 Khi đổi trang hoặc thay đổi số phần tử/trang
  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({ ...pagination, current: page, pageSize });
    loadDecisions(page, pageSize);
  };

  useEffect(() => {
    loadDecisions(pagination.current, pagination.pageSize);
  }, []);

  return (
    <>
      <Card
        title={
          <Text style={{ paddingLeft: 20, fontSize: 17 }} strong>
            📄 Quyết định chờ duyệt
          </Text>
        }

        className="decision-list-card"
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin />
          </div>
        ) : decisions.length === 0 ? (
          <Text style={{ padding: 20, display: "block" }}>
            Không có nghị quyết chờ duyệt
          </Text>
        ) : (
          <div>
            {decisions.map((d, i) => (
              <div key={i} className="decision-item">
                <div className="decision-item-left">
                  <Text strong className="decision-code">
                    {d.decisionNumber || d.code}
                  </Text>
                  <p className="decision-title">{d.decisionName || d.title}</p>
                  <p className="decision-date">
                    <CalendarOutlined />{" "}
                    Ngày tạo:{" "}
                    {d.createdAt
                      ? (() => { const date = new Date(d.createdAt); const h = String(date.getHours()).padStart(2, '0'); const m = String(date.getMinutes()).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${h}:${m} ${day}/${month}/${year}`; })()
                      : "Không rõ"}
                  </p>
                </div>

                <div className="decision-item-right">
                  <Tag color="orange" className="decision-tag">
                    Chờ duyệt
                  </Tag>
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDecision(d)}
                  />

                </div>
              </div>
            ))}

            {/* ✅ Phân trang có chọn số bản ghi/trang */}
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger={true}
                pageSizeOptions={[5, 10, 20, 50]}
                showTotal={(total) => `Tổng ${total} nghị quyết`}
              />
            </div>
          </div>
        )}
      </Card>
      {/* 🧩 Modal xem chi tiết quyết định */}
      <ViewDecisionModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewDecisionData(null);
        }}
        data={viewDecisionData}
        loading={viewLoading}
        voters={voters}
        organize={organize}
        documents={document}
        electionentities={entities}
        meeting={meeting}
      />
    </>
  );
};

export default DecisionList;
