import React, { useEffect, useState } from "react";
import VotingResultDetailList from "./result-detail/VotingResultDetailList";
import VotingResultSummary from "./result-detail/VotingResultSummary";
import "../../../style/voter/VotingResult.model.css";
import ResultService from "@/services/ResultService";
import { useLoading } from "@/contexts/LoadingContext";
import { Card, Typography } from "antd";
import {
    InboxOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;


const VotingResultDetail: React.FC = () => {
    const { showLoading, hideLoading } = useLoading();
    const [hasData, setHasData] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                showLoading();
                const electionId = localStorage.getItem("currentElectionId") || "";
                if (!electionId) return;

                const res = await ResultService.getByElectionId(electionId);

                const results = res?.data || [];

                const hasSignedResult = results.some((item: any) => item.status === "SIGNED");

                setHasData(hasSignedResult);

            } catch {
                setHasData(false);
            } finally {
                hideLoading();
            }
        };

        fetchDetail();
    }, []);


    if (!hasData)
        return (
            <div style={{ padding: '24px 32px' }}>
                <Card className="voting-single-card no-voting-card">
                    <div className="no-voting-container">
                        <div className="no-voting-icon">
                            <InboxOutlined />
                        </div>
                        <Title level={4} className="no-voting-title">
                            Chưa có kết quả của cuộc bầu cử
                        </Title>
                        <Text type="secondary" className="no-voting-description">
                            Vui lòng chờ kết quả từ ban tổ chức
                        </Text>

                    </div>
                </Card>
            </div>
        );

    return (
        <div>
            <VotingResultSummary />
            <VotingResultDetailList />
        </div>
    );
};

export default VotingResultDetail;


