import { FileTextOutlined } from "@ant-design/icons";
import { Card, Progress, Typography } from "antd";
import React, { useEffect, useState } from "react";
import ElectionService from "@/services/ElectionService";
import ResultService from "@/services/ResultService";

const { Text } = Typography;

interface YesNoResult {
    id: string;
    entityTitle: string;
    yes: { count: number; percent: number };
    no: { count: number; percent: number };
    abstain: { count: number; percent: number };
}

interface CumulativeItem {
    _id: string;
    totalVotes: number;
    percentage: number;
    entityTitle: string;
}

interface CandidateResult {
    id: string;
    totalVotes?: number;
    percentage?: number;
    entityTitle: string;

    yes?: { count: number; percent: number };
    no?: { count: number; percent: number };
}

const VotingResultDetailList: React.FC = () => {
    const [methodCode, setMethodCode] = useState<string | null>(null);
    const [candidates, setCandidates] = useState<CandidateResult[]>([]);
    const electionId = localStorage.getItem("currentElectionId") || "";

    // Load voting method
    useEffect(() => {
        const loadElection = async () => {
            const election = await ElectionService.getElectionId(electionId);
            setMethodCode(election.votingMethodId.methodCode);
        };
        loadElection();
    }, [electionId]);

    // Load result
    useEffect(() => {
        if (!methodCode) return;

        const loadResult = async () => {
            try {
                /** ===============================
                 *   CASE 1: CUMULATIVE
                 * =============================== */
                if (methodCode === "CUMULATIVE") {
                    const result: CumulativeItem[] =
                        await ResultService.getCumulativeResult(electionId);

                    const mapped: CandidateResult[] = result.map((item) => ({
                        id: item._id,
                        totalVotes: item.totalVotes,
                        percentage: item.percentage,
                        entityTitle: item.entityTitle,
                    }));

                    setCandidates(mapped);
                }

                else if (methodCode === "YES_NO_ABSTAIN") {
                    const result = await ResultService.getYesNoResult(electionId);

                    const item = result[0]; // backend trả 1 object duy nhất

                    const yesPercent = item.totalVotes ? (item.agree / item.totalVotes) * 100 : 0;
                    const noPercent = item.totalVotes ? (item.disagree / item.totalVotes) * 100 : 0;
                    const abstainPercent = item.totalVotes ? (item.abstain / item.totalVotes) * 100 : 0;

                    const mapped: YesNoResult = {
                        id: item._id,
                        entityTitle: item.entityTitle,
                        yes: { count: item.agree, percent: yesPercent },
                        no: { count: item.disagree, percent: noPercent },
                        abstain: { count: item.abstain, percent: abstainPercent }
                    };

                    setCandidates([mapped]);
                }

            } catch (error) {
                console.error(error);
            }
        };

        loadResult();
    }, [methodCode]);


    const yesNoItem = candidates[0] as YesNoResult;


    return (
        <div className="voting-wrapper-detail">
            <Card
                title={
                    <div className="detail-header">
                        <FileTextOutlined className="icon" />
                        <Text strong>Kết quả chi tiết</Text>
                    </div>
                }
                className="detail-card"
            >


                {methodCode === "YES_NO_ABSTAIN" && yesNoItem && (
                    <div className="yesno-wrapper">

                        <h3 className="yesno-title">Bầu cử: {yesNoItem.entityTitle}</h3>
                        <div className="yesno-row">
                            <span className="yesno-label">Đồng ý</span>

                            <span className="yesno-percent yes">{yesNoItem.yes.percent.toFixed(0)}%</span>

                            <Progress
                                percent={yesNoItem.yes.percent}
                                showInfo={false}
                                strokeColor="#52c41a"
                                strokeWidth={8}
                                className="yesno-progress"
                            />

                            <span className="yesno-count">{yesNoItem.yes.count} phiếu</span>
                        </div>

                        <div className="yesno-row">
                            <span className="yesno-label">Không đồng ý</span>
                            <span className="yesno-percent no">{yesNoItem.no.percent.toFixed(0)}%</span>

                            <Progress
                                percent={yesNoItem.no.percent}
                                showInfo={false}
                                strokeColor="#f5222d"
                                strokeWidth={8}
                                className="yesno-progress"
                            />

                            <span className="yesno-count">{yesNoItem.no.count} phiếu</span>
                        </div>

                        <div className="yesno-row">
                            <span className="yesno-label">Không ý kiến</span>
                            <span className="yesno-percent abstain">
                                {yesNoItem.abstain.percent.toFixed(0)}%
                            </span>

                            <Progress
                                percent={yesNoItem.abstain.percent}
                                showInfo={false}
                                strokeColor="#faad14"
                                strokeWidth={8}
                                className="yesno-progress"
                            />

                            <span className="yesno-count">
                                {yesNoItem.abstain.count} phiếu
                            </span>
                        </div>




                    </div>
                )}


                {methodCode === "CUMULATIVE" &&
                    candidates.map((c, index) => (
                        <Card key={c.id} className="candidate-card">
                            <div className="candidate-row">
                                <div className="candidate-info">
                                    <div className="rank-circle">{index + 1}</div>
                                    <div className="abbr-circle">{c.entityTitle.substring(0, 1)}</div>
                                    <Text strong>{c.entityTitle}</Text>
                                </div>

                                <div className="candidate-stats">
                                    <div>
                                        <Text strong className="stat-green">{c.totalVotes}</Text>
                                        <p>Phiếu bầu</p>
                                    </div>
                                    <div>
                                        <Text strong className="stat-green">{c.percentage}%</Text>
                                        <p>Tỷ lệ</p>
                                    </div>
                                </div>
                            </div>

                            <Progress
                                percent={c.percentage}
                                showInfo={false}
                                strokeColor="#7ECB50"
                            />
                        </Card>
                    ))}

            </Card>
        </div>
    );
};

export default VotingResultDetailList;
