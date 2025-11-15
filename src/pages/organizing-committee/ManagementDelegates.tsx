import React, { useState, useEffect } from "react";
import { Card, Row, Col, Layout, Select, message, Spin } from "antd";
import { useParams } from "react-router-dom";
import DelegateTable from "@/components/organizing-committee/manage-delegates/DelegateTable";
import DelegateSearch from "@/components/organizing-committee/manage-delegates/DelegateSearch";
import DelegateManualAdd from "@/components/organizing-committee/manage-delegates/DelegateManualAdd";
import DelegateUpload from "@/components/organizing-committee/manage-delegates/DelegateUpload";
import ElectionService from "@/services/ElectionService";
import { Election } from "@/types/Election.interface";
import { BaseResponse } from "@/types/BaseResponse.interface";

const ManagementDelegates: React.FC = () => {
    const { electionId: electionIdFromParams } = useParams<{ electionId?: string }>();
    const [selectedElectionId, setSelectedElectionId] = useState<string>(
        electionIdFromParams || localStorage.getItem("selectedElectionId") || ""
    );
    const [search, setSearch] = useState("");
    const [elections, setElections] = useState<Election[]>([]);
    const [loadingElections, setLoadingElections] = useState<boolean>(true);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [searchResults, setSearchResults] = useState<any[] | null>(null);

    // Load danh sách cuộc bầu cử từ API
    useEffect(() => {
        const fetchElections = async () => {
            try {
                setLoadingElections(true);
                const response: BaseResponse<any> = await ElectionService.searchElections({
                    limit: 100,
                });
                
                if (response.success && response.data) {
                    // API trả về dạng pagination với structure: { content, page, limit, totalItems, totalPages }
                    const electionsData = response.data.content || response.data;
                    setElections(Array.isArray(electionsData) ? electionsData : []);
                } else {
                    message.error(response.message || "Không thể tải danh sách cuộc bầu cử");
                }
            } catch (error: any) {
                console.error("Lỗi khi tải danh sách cuộc bầu cử:", error);
                message.error(error?.response?.data?.message || "Đã xảy ra lỗi khi tải danh sách cuộc bầu cử");
            } finally {
                setLoadingElections(false);
            }
        };

        fetchElections();
    }, []);

    // Lưu electionId vào localStorage khi thay đổi
    useEffect(() => {
        if (selectedElectionId) {
            localStorage.setItem("selectedElectionId", selectedElectionId);
        }
    }, [selectedElectionId]);

    return (
        <Layout style={{ background: "#F3F8F3", minHeight: "100vh", padding: "20px" }}>
            <Card className="manage-container" style={{ borderRadius: 12 }}>
                <h2>Quản lý Danh sách Đại biểu & Cổ đông</h2>
                <p>Thêm mới, nhập và quản lý danh sách người tham dự cho sự kiện của bạn.</p>

                {/* Select cuộc bầu cử */}
                <div style={{ marginBottom: 20, marginTop: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
                        Chọn cuộc bầu cử:
                    </label>
                    <Select
                        style={{ width: "100%", maxWidth: 400 }}
                        placeholder={loadingElections ? "Đang tải..." : "Chọn cuộc bầu cử"}
                        value={selectedElectionId || undefined}
                        onChange={(value) => {
                            setSelectedElectionId(value);
                            setSearchResults(null); // Reset kết quả tìm kiếm khi đổi election
                            message.info("Đang tải danh sách cử tri...");
                        }}
                        loading={loadingElections}
                        notFoundContent={loadingElections ? <Spin size="small" /> : "Không tìm thấy cuộc bầu cử"}
                    >
                        {elections.map((election) => (
                            <Select.Option key={election._id} value={election._id}>
                                {election.title || `Cuộc bầu cử ${election._id}`}
                            </Select.Option>
                        ))}
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
