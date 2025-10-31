import React from "react";
import { Button, Space } from "antd";
import {
    DownloadOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";

import VoteResultChart from "../../components/board_of_control/verify_result/VoteResultChart";
import VoteSummary from "../../components/board_of_control/verify_result/VoteSummary";
import VoteVerificationDetail from "../../components/board_of_control/verify_result/VoteVerificationDetail";
import {
    CandidateResult,
    VoteSummaryCard,
    VoteLogItem,
    VerificationDetailData,
} from "../../types/ElectionVerification.interface";

import "../../style/board-of-control/ElectionVerification.model.css";

export default function ElectionVerificationPage() {
    const resultData: CandidateResult[] = [
        { name: "Nguyễn Thị Lan Anh", votes: 850, percent: 45.2 },
        { name: "Trần Minh Hoàng", votes: 620, percent: 33.0 },
        { name: "Lê Gia Bảo", votes: 410, percent: 21.8 },
    ];

    const summaryCards: VoteSummaryCard[] = [
        { title: "Tổng số Cổ tri", value: "2,000" },
        { title: "Số phiếu đã vào", value: "1,880" },
        { title: "Tỷ lệ Tham gia", value: "94.0%" },
        { title: "Phiếu Hợp lệ", value: "1,880", highlight: true },
    ];


    const verification = {
        totalCheckin: 1880,
        totalVotes: 1880,
        isDataValid: true,
        checksumBefore: "a1b2c3d4...e5f6",
        checksumAfter: "a1b2c3d4...e5f6",
    };

    const voteLogs = [
        {
            id: "VOTE_5a8f83c...",
            time: "15/10/2025 10:35:12 AM",
            status: "Hợp lệ",
        },
        {
            id: "VOTE_9b2d7e...",
            time: "15/10/2025 10:35:08 AM",
            status: "Hợp lệ",
        },
    ];


    return (
        <>
            <div className="ev-topbar">
                <Space>
                    <Button icon={<DownloadOutlined />}>Tải xuống</Button>
                    <Button danger icon={<CloseCircleOutlined />}>
                        Từ chối Kết quả
                    </Button>
                </Space>
            </div>
            <div className="ev-page">

                <h2 className="ev-title">Xác minh Kết quả Bầu cử</h2>
                <p className="ev-subtitle">Sự kiện: Bầu cử Hội đồng Quản trị 2025</p>

                <VoteResultChart data={resultData} />
                <VoteSummary cards={summaryCards} />
                <VoteVerificationDetail verification={verification} logs={voteLogs} />
            </div>
        </>
    );
}