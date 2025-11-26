import React, { useState, useEffect } from "react";
import { Card, Row, Col, Layout, Select, Spin } from "antd";
import { useParams } from "react-router-dom";
import DelegateTable from "@/components/organizing-committee/manage-delegates/DelegateTable";
import DelegateSearch from "@/components/organizing-committee/manage-delegates/DelegateSearch";
import DelegateManualAdd from "@/components/organizing-committee/manage-delegates/DelegateManualAdd";
import DelegateUpload from "@/components/organizing-committee/manage-delegates/DelegateUpload";
import ElectionService from "@/services/ElectionService";
import { Election } from "@/types/Election.interface";
import { BaseResponse } from "@/types/BaseResponse.interface";
import { useNotification } from "@/contexts/NotificationContext";

const ManagementDelegates: React.FC = () => {
    const { notify } = useNotification();
    const { electionId: electionIdFromParams } = useParams<{ electionId?: string }>();
    // Lấy cuộc bầu cử từ localStorage (đã được chọn ở trang home)
    const currentElectionId = electionIdFromParams || localStorage.getItem("currentElectionId") || "";
    const [selectedElectionId, setSelectedElectionId] = useState<string>(currentElectionId);
    const [selectedElection, setSelectedElection] = useState<Election | null>(null);
    const [loadingElection, setLoadingElection] = useState<boolean>(!!currentElectionId);
    const [search, setSearch] = useState("");
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [searchResults, setSearchResults] = useState<any[] | null>(null);

    // Load thông tin cuộc bầu cử đã chọn
    useEffect(() => {
        const fetchElection = async () => {
            if (!currentElectionId) {
                notify("Vui lòng chọn cuộc bầu cử từ trang chủ", "warning");
                return;
            }

            try {
                setLoadingElection(true);
                const election = await ElectionService.getElectionId(currentElectionId);
                setSelectedElection(election);
                setSelectedElectionId(currentElectionId);
            } catch (error: any) {
                console.error("Lỗi khi tải thông tin cuộc bầu cử:", error);
                notify(error?.response?.data?.message || "Không thể tải thông tin cuộc bầu cử", "error");
            } finally {
                setLoadingElection(false);
            }
        };

        fetchElection();
    }, [currentElectionId]);

    return (
        <Layout style={{ background: "#F3F8F3", minHeight: "100vh", padding: "20px" }}>
            <Card className="manage-container" style={{ borderRadius: 12 }}>
                <h2>Quản lý Danh sách Đại biểu & Cổ đông</h2>
                <p>Thêm mới, nhập và quản lý danh sách người tham dự cho sự kiện của bạn.</p>

                {/* Hiển thị cuộc bầu cử đã chọn (không cho chọn lại) */}
                <div style={{ marginBottom: 20, marginTop: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                        Cuộc bầu cử:
                    </label>
                    <Select
                        style={{ width: "100%", maxWidth: 400 }}
                        placeholder={loadingElection ? "Đang tải..." : "Chọn cuộc bầu cử"}
                        value={selectedElectionId || undefined}
                        disabled={true} // Disable dropdown - không cho chọn lại
                        loading={loadingElection}
                        suffixIcon={null} // Ẩn icon mũi tên xuống
                    >
                        {selectedElection && (
                            <Select.Option key={selectedElection._id} value={selectedElection._id}>
                                {selectedElection.title || `Cuộc bầu cử ${selectedElection._id}`}
                            </Select.Option>
                        )}
                    </Select>
                </div>

                <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
                    <Col xs={24} md={14}>
                        <DelegateUpload />
                    </Col>
                    <Col xs={24} md={10}>
                        <DelegateManualAdd
                            electionId={selectedElectionId}
                            onAdd={() => {
                                // Trigger reload bằng cách thay đổi key
                                setRefreshKey(prev => prev + 1);
                            }}
                        />
                    </Col>
                </Row>

                <div style={{ marginTop: 32 }}>
                    <DelegateSearch
                        electionId={selectedElectionId}
                        onSearchResult={(results) => {
                            setSearchResults(results.length > 0 ? results : null);
                        }}
                    />
                    {selectedElectionId ? (
                        <DelegateTable
                            key={`${selectedElectionId}-${refreshKey}`}
                            electionId={selectedElectionId}
                            searchResults={searchResults}
                        />
                    ) : (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                            Vui lòng chọn cuộc bầu cử để xem danh sách cử tri
                        </div>
                    )}
                </div>
            </Card>
        </Layout>
    );
};

export default ManagementDelegates;
