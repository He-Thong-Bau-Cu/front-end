import { Card, Typography, Progress } from "antd";
import "../../../style/preside/ElectionResults.model.css";

const { Text } = Typography;

const CandidateResults = ({ candidates }) => {
  return (
    <Card className="candidate-card">
      <Text strong>Kết quả theo ứng viên</Text>
      {candidates.map((c) => (
        <div key={c.name} style={{ marginTop: 12 }}>
          <div className="candidate-name">{c.name}</div>
          <Progress
            percent={c.percent}
            format={() => `${c.votes} phiếu (${c.percent}%)`}
            strokeColor="#95de64"
            trailColor="#f0f0f0"
            showInfo
          />
        </div>
      ))}
    </Card>
  );
};

export default CandidateResults;
