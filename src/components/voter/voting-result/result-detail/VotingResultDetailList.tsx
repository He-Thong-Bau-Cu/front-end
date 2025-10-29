import { FileTextOutlined } from "@ant-design/icons";
import { Card, Progress, Tag, Typography } from "antd";
import React from "react";

const { Text } = Typography;

interface Candidate {
    id: number;
    name: string;
    abbreviation: string;
    party: string;
    age: number;
    location: string;
    votes: number;
    percent: number;
    diff: number;
    highlight?: boolean;
}

const candidates: Candidate[] = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        abbreviation: "NA",
        party: "Đảng Cộng sản Việt Nam",
        age: 50,
        location: "TP. Hồ Chí Minh",
        votes: 5842,
        percent: 39.3,
        diff: 1234,
        highlight: true,
    },
    {
        id: 2,
        name: "Trần Thị B",
        abbreviation: "TB",
        party: "Đảng Cộng sản Việt Nam",
        age: 45,
        location: "TP. Hồ Chí Minh",
        votes: 4608,
        percent: 31.0,
        diff: -1234,
    },
    {
        id: 3,
        name: "Lê Văn C",
        abbreviation: "LC",
        party: "Đảng Cộng sản Việt Nam",
        age: 52,
        location: "TP. Hồ Chí Minh",
        votes: 2672,
        percent: 18.0,
        diff: -1936,
    },
];

const VotingResultDetailList: React.FC = () => {


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
                {candidates.map((c, index) => (
                    <Card
                        key={c.id}
                        className={`candidate-card ${c.highlight ? "highlight" : ""}`}
                    >
                        <div className="candidate-row">
                            {/* Ứng viên */}
                            <div className="candidate-info">
                                <div
                                    className={`rank-circle ${c.highlight ? "rank-highlight" : ""
                                        }`}
                                >
                                    {index + 1}
                                </div>
                                <div
                                    className={`abbr-circle ${c.highlight ? "abbr-highlight" : ""
                                        }`}
                                >
                                    {c.abbreviation}
                                </div>
                                <div>
                                    <Text strong>{c.name}</Text>
                                    <p className="candidate-meta">
                                        {c.party} • {c.age} tuổi • {c.location}
                                    </p>
                                </div>
                            </div>

                            {/* Số liệu */}
                            <div className="candidate-stats">
                                <div>
                                    <Text strong className="stat-green">
                                        {c.votes}
                                    </Text>
                                    <p>Phiếu bầu</p>
                                </div>
                                <div>
                                    <Text strong className="stat-green">
                                        {c.percent}%
                                    </Text>
                                    <p>Tỷ lệ</p>
                                </div>
                                <div>
                                    <Text
                                        strong
                                        className={c.diff > 0 ? "stat-green" : "stat-red"}
                                    >
                                        {c.diff > 0 ? `+${c.diff}` : c.diff}
                                    </Text>
                                    <p>Cách biệt</p>
                                </div>
                                {c.highlight && (
                                    <Tag color="green" className="winner-tag">
                                        Đắc cử
                                    </Tag>
                                )}
                            </div>
                        </div>

                        {/* Thanh tiến độ */}
                        <div className="progress-row">
                            <Progress
                                percent={c.percent}
                                showInfo={false}
                                strokeColor={c.highlight ? "#7ECB50" : "#95a5a6"}
                                trailColor="#f0f0f0"
                                strokeWidth={10}
                            />
                            <Text type="secondary" className="vote-count">
                                {c.votes.toLocaleString()} phiếu
                            </Text>
                        </div>
                    </Card>
                ))}
            </Card>
        </div>
    );
};

export default VotingResultDetailList;
