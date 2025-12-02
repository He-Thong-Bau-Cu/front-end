import { Card, Progress, Typography, Row, Col, Empty } from "antd";
import { Candidate } from "../../../types/VottingProcess.interface";

const { Text } = Typography;


export default function LiveResult({ candidates }: { candidates: Candidate[] }) {
  return (
    <Card className="vd-card vd-result-card" bordered={false}>
      <Text className="vd-section-title">Kết quả Bỏ phiếu Trực tiếp</Text>

      <div className="vd-result-list">
        {candidates && candidates.length > 0 ? (
          candidates.map((c) => (
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
          ))
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <Empty
              description={<span style={{ color: '#999' }}>Chưa có kết quả bầu cử</span>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
