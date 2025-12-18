import { FileTextOutlined, StarFilled } from "@ant-design/icons";
import { Card, Progress, Typography, Tag } from "antd";
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

interface EntityMetaData {
    type: "project" | "person" | "other";
    projectName?: string;
    fullName?: string;
    label?: string;
}


interface CumulativeItem {
    _id: string;
    totalVotes: number;
    percentage: number;
    entityTitle: string;
    entityMetaData?: EntityMetaData;

}

interface CandidateResult {
    id: string;
    totalVotes?: number;
    percentage?: number;
    entityTitle: string;
    metaData?: EntityMetaData;


    yes?: { count: number; percent: number };
    no?: { count: number; percent: number };
}

const formatNumber = (value?: number) => {
    if (value === undefined || value === null) return 0;
    return value.toLocaleString("vi-VN");
};


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
                        metaData: item.entityMetaData,
                    }));

                    setCandidates(mapped);
                }

                else if (methodCode === "YES_NO_ABSTAIN") {
                    const result = await ResultService.getYesNoResult(electionId);

                    const item = result[0] || {};

                    const agree = item.agree ?? 0;
                    const disagree = item.disagree ?? 0;
                    const abstain = item.abstain ?? 0;
                    const totalVotingPower = agree + disagree + abstain;

                    const yesPercent = totalVotingPower
                        ? (agree / totalVotingPower) * 100
                        : 0;

                    const noPercent = totalVotingPower
                        ? (disagree / totalVotingPower) * 100
                        : 0;

                    const abstainPercent = totalVotingPower
                        ? (abstain / totalVotingPower) * 100
                        : 0;


                    const mapped: YesNoResult = {
                        id: item._id || "",
                        entityTitle: item.entityTitle || "",
                        yes: { count: agree, percent: yesPercent },
                        no: { count: disagree, percent: noPercent },
                        abstain: { count: abstain, percent: abstainPercent }
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

    // Xác định option thắng (chỉ so sánh giữa yes và no, không tính abstain)
    const getYesNoWinner = () => {
        if (!yesNoItem) return null;
        const { yes, no } = yesNoItem;

        // Chỉ so sánh yes và no, abstain không được tính là thắng
        if (yes.percent > no.percent) return 'yes';
        if (no.percent > yes.percent) return 'no';
        // Nếu bằng nhau thì không có thắng
        return null;
    };

    // Xác định candidate thắng trong CUMULATIVE (có percentage cao nhất)
    const getCumulativeWinner = () => {
        if (candidates.length === 0) return null;
        const maxPercentage = Math.max(...candidates.map(c => c.percentage || 0));
        const winner = candidates.find(c => c.percentage === maxPercentage);
        return winner ? winner.id : null;
    };

    const yesNoWinner = methodCode === "YES_NO_ABSTAIN" ? getYesNoWinner() : null;
    const cumulativeWinnerId = methodCode === "CUMULATIVE" ? getCumulativeWinner() : null;

    const getAbbr = (c: CandidateResult) => {
        if (c.metaData?.type === "person" && c.metaData.fullName) {
            return c.metaData.fullName.trim().charAt(0).toUpperCase();
        }
        if (c.metaData?.type === "project" && c.metaData.projectName) {
            return c.metaData.projectName.trim().charAt(0).toUpperCase();
        }
        return c.entityTitle.trim().charAt(0).toUpperCase();
    };


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
                        <div className={`yesno-row ${yesNoWinner === 'yes' ? 'winner' : ''}`}>
                            {yesNoWinner === 'yes' && (
                                <Tag icon={<StarFilled />} color="success" className="winner-tag">
                                    Thắng
                                </Tag>
                            )}
                            <span className="yesno-label">Đồng ý</span>

                            {/* <span className="yesno-percent yes">{yesNoItem.yes.percent.toFixed(0)}%</span> */}

                            <Progress
                                percent={yesNoItem.yes.percent}
                                showInfo={false}
                                strokeColor="#52c41a"
                                strokeWidth={8}
                                className="yesno-progress"
                            />

                            <span className="yesno-count">{yesNoItem.yes.count} %</span>
                        </div>

                        <div className={`yesno-row ${yesNoWinner === 'no' ? 'winner' : ''}`}>
                            {yesNoWinner === 'no' && (
                                <Tag icon={<StarFilled />} color="success" className="winner-tag">
                                    Thắng
                                </Tag>
                            )}
                            <span className="yesno-label">Không đồng ý</span>
                            {/* <span className="yesno-percent no">{yesNoItem.no.percent.toFixed(0)}%</span> */}

                            <Progress
                                percent={yesNoItem.no.percent}
                                showInfo={false}
                                strokeColor="#f5222d"
                                strokeWidth={8}
                                className="yesno-progress"
                            />

                            <span className="yesno-count">{yesNoItem.no.count} %</span>
                        </div>

                        <div className="yesno-row">
                            <span className="yesno-label">Không ý kiến</span>
                            {/* <span className="yesno-percent abstain">
                                {yesNoItem.abstain.percent.toFixed(0)}%
                            </span> */}

                            <Progress
                                percent={yesNoItem.abstain.percent}
                                showInfo={false}
                                strokeColor="#faad14"
                                strokeWidth={8}
                                className="yesno-progress"
                            />

                            <span className="yesno-count">
                                {yesNoItem.abstain.count} %
                            </span>
                        </div>




                    </div>
                )}


                {methodCode === "CUMULATIVE" &&
                    candidates.map((c, index) => (
                        <Card key={c.id} className={`candidate-card ${cumulativeWinnerId === c.id ? 'winner' : ''}`}>
                            {cumulativeWinnerId === c.id && (
                                <Tag icon={<StarFilled />} color="success" className="winner-tag">
                                    Thắng
                                </Tag>
                            )}
                            <div className="candidate-row">
                                <div className="candidate-info">
                                    <div className="rank-circle">{index + 1}</div>
                                    {/* <div className="abbr-circle">
                                        {getAbbr(c)}
                                    </div> */}
                                    <div className="candidate-text">
                                        <Text strong>
                                            {c.metaData?.type === "person" && c.metaData.fullName}
                                            {c.metaData?.type === "project" && c.metaData.projectName}
                                            {!c.metaData && c.entityTitle}
                                        </Text>

                                        <Text style={{ fontSize: 12, color: "#888" }}>
                                            {c.entityTitle}
                                        </Text>
                                    </div>
                                </div>

                                <div className="candidate-stats">
                                    <div>
                                        <Text strong className="stat-green">{formatNumber(c.totalVotes)}</Text>
                                        <p>Quyền biểu quyết</p>
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
