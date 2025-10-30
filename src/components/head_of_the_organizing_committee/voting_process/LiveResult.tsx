import { Card, Progress, Typography, Row, Col } from "antd";
import { Candidate } from "../../../types/VottingProcess.interface";

const { Text } = Typography;


export default function LiveResult({ candidates }: { candidates: Candidate[] }) {
  return (
    <Card className="vd-card vd-result-card" bordered={false}>
      <Text className="vd-section-title">Kết quả Bỏ phiếu Trực tiếp</Text>

      <div className="vd-result-list">
        {candidates.map((c) => (
          <div key={c.id} className="vd-result-item">
            <div className="vd-result-header">
              <Text className="vd-candidate-name">{c.name}</Text>
              <Text className="vd-candidate-votes">
                {c.votes} phiếu ({c.percent}%)
              </Text>
            </div>

            <Progress
              percent={c.percent}
              showInfo={false}
              strokeColor={{
                from: "#8DFE8B",
                to: "#52C41A",
              }}
              trailColor="#f5f5f5"
              strokeWidth={12}
              className="vd-result-progress"
            />
          </div>
        ))}
      </div>
    </Card>
  );
}