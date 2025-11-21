import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, Row, Col, Typography, Spin } from "antd";
import { 
    FileTextOutlined, 
    CheckCircleOutlined, 
    ClockCircleOutlined,
    DatabaseOutlined, 
    EditOutlined,
    FileOutlined,
    FileAddOutlined
} from "@ant-design/icons";
import DecisionService from "@/services/DecisionService";

const { Text } = Typography;

interface StatItem {
    label: string;
    value: number;
    color: string;
    icon: React.ReactNode;
}

interface StatsData {
    total: number;
    approved: number;
    waitEnterData: number;
    waitApproval: number;
    requestEdit: number;
    draft: number;
    deleted: number;
}

interface DecisionStatsProps {
    refreshTrigger?: number; // Trigger refresh khi giá trị này thay đổi
    autoRefreshInterval?: number; // Thời gian tự động refresh (ms), mặc định 30 giây
    enableAutoRefresh?: boolean; // Bật/tắt auto refresh, mặc định true
}

const DecisionStats: React.FC<DecisionStatsProps> = ({ 
    refreshTrigger, 
    autoRefreshInterval = 30000, // 30 giây
    enableAutoRefresh = true 
}) => {
    const [stats, setStats] = useState<StatsData>({
        total: 0,
        approved: 0,
        waitEnterData: 0,
        waitApproval: 0,
        requestEdit: 0,
        draft: 0,
        deleted: 0,
    });
    const [loading, setLoading] = useState(true);

    // Load stats function
    const loadStats = useCallback(async (showLoading = false) => {
        // Chỉ hiển thị loading khi được yêu cầu (lần đầu load hoặc manual refresh)
        if (showLoading) {
            setLoading(true);
        }
        
        try {
            // Lấy tất cả dữ liệu để tính toán thống kê
            const response = await DecisionService.getAllDecisions({
                page: 1,
                limit: 10000, // Lấy nhiều để đếm tất cả
            });

            // Đếm theo statusData
            const total = response.totalItems || 0;
            let approved = 0;
            let waitEnterData = 0;
            let waitApproval = 0;
            let requestEdit = 0;
            let draft = 0;
            let deleted = 0;

            response.content.forEach((item: any) => {
                const statusData = item.statusData || item.status || "";
                
                if (statusData === "APPROVED_SIGNED") {
                    approved++;
                } else if (statusData === "WAIT_ENTER_DATA") {
                    waitEnterData++;
                } else if (statusData === "WAIT_APPROVAL") {
                    waitApproval++;
                } else if (statusData === "REQUEST_EDIT") {
                    requestEdit++;
                } else if (statusData === "DRAFT") {
                    draft++;
                } else if (statusData === "DELETED") {
                    deleted++;
                }
            });

            // Chỉ cập nhật state nếu có thay đổi để tránh re-render không cần thiết
            setStats(prevStats => {
                const newStats = {
                    total,
                    approved,
                    waitEnterData,
                    waitApproval,
                    requestEdit,
                    draft,
                    deleted,
                };
                
                // Kiểm tra xem có thay đổi không
                const hasChanged = 
                    prevStats.total !== newStats.total ||
                    prevStats.approved !== newStats.approved ||
                    prevStats.waitEnterData !== newStats.waitEnterData ||
                    prevStats.waitApproval !== newStats.waitApproval ||
                    prevStats.requestEdit !== newStats.requestEdit ||
                    prevStats.draft !== newStats.draft ||
                    prevStats.deleted !== newStats.deleted;
                
                // Chỉ cập nhật nếu có thay đổi
                return hasChanged ? newStats : prevStats;
            });
        } catch (error: any) {
            console.error("Error loading stats:", error);
            // Giữ giá trị cũ khi lỗi để không bị mất dữ liệu
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    }, []);

    // Load stats lần đầu khi component mount
    useEffect(() => {
        loadStats(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load stats khi refreshTrigger thay đổi (từ bên ngoài)
    useEffect(() => {
        if (refreshTrigger !== undefined && refreshTrigger > 0) {
            loadStats(true); // Hiển thị loading khi trigger từ bên ngoài
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]);

    // Auto refresh theo định kỳ
    useEffect(() => {
        if (!enableAutoRefresh) return;

        const intervalId = setInterval(() => {
            console.log("Auto refreshing DecisionStats...");
            loadStats(false); // Không hiển thị loading khi auto refresh
        }, autoRefreshInterval);

        // Cleanup interval khi component unmount hoặc dependencies thay đổi
        return () => {
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enableAutoRefresh, autoRefreshInterval]);

    const statItems: StatItem[] = useMemo(() => [
        {
            label: "Tổng quyết định",
            value: stats.total,
            color: "#1890ff",
            icon: <FileTextOutlined />,
        },
        {
            label: "Đã phê duyệt",
            value: stats.approved,
            color: "#52c41a",
            icon: <CheckCircleOutlined />,
        },
        {
            label: "Chờ nhập dữ liệu",
            value: stats.waitEnterData,
            color: "#f56a00",
            icon: <ClockCircleOutlined />,
        },
        {
            label: "Chờ duyệt",
            value: stats.waitApproval,
            color: "#faad14",
            icon: <DatabaseOutlined />,
        },
        {
            label: "Từ chối",
            value: stats.requestEdit,
            color: "pink",
            icon: <EditOutlined />,
        },
        {
            label: "Lưu nháp",
            value: stats.draft,
            color: "#d81b60",
            icon: <FileAddOutlined />,
        },
    ], [stats]);

    if (loading) {
        return (
            <Row gutter={[12, 12]} className="decision-stats-row">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Col key={i} xs={24} sm={12} md={8} lg={6} xl={4}>
                        <Card 
                            className="decision-stat-card" 
                        >
                            <div style={{ 
                                display: "flex", 
                                justifyContent: "center", 
                                alignItems: "center", 
                                minHeight: 50 
                            }}>
                                <Spin size="small" />
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    }

    return (
        <Row gutter={[12, 12]} className="decision-stats-row">
            {statItems.map((item, i) => (
                <Col key={i} xs={24} sm={12} md={8} lg={6} xl={4}>
                    <Card
                        className="decision-stat-card"
                        style={{
                            borderLeft: `6px solid ${item.color}`, padding: 10
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                                style={{
                                    fontSize: 30,
                                    color: item.color,
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                {item.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Text
                                    className="decision-stat-value"
                                    style={{
                                        color: item.color,
                                        fontSize: 30,
                                        fontWeight: "bold",
                                        display: "block",
                                        lineHeight: 1.2,
                                        marginBottom: 4,
                                    }}
                                >
                                    {item.value}
                                </Text>
                                <div 
                                    className="decision-stat-label"
                                    style={{
                                        fontSize: 13,
                                        lineHeight: 1.3,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {item.label}
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default DecisionStats;

