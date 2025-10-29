import { Card, Typography } from "antd";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "../../../style/preside/ElectionResults.model.css";

const { Text } = Typography;

const COLORS = ["#95de64", "#d9d9d9"];

const VoterStatusChart = ({ data, percent }) => (
  <Card className="chart-card voter-status-card">
    <Text className="chart-title">Trạng thái cử tri</Text>

    <div className="voter-chart-wrapper">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="45%"
            outerRadius="70%"
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [`${value} người`, name]} />
          <Legend verticalAlign="bottom" height={40} />
        </PieChart>
      </ResponsiveContainer>
    </div>

    <div className="voter-percent">
      <Text strong style={{ fontSize: 18 }}>{percent}%</Text>
      <Text type="secondary" style={{ marginLeft: 4 }}>Đã bỏ phiếu</Text>
    </div>
  </Card>
);

export default VoterStatusChart;
