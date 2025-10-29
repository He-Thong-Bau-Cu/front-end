import { Card, Typography } from "antd";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../../../style/preside/ElectionResults.model.css";

const { Text } = Typography;

const VoteProgressChart = ({ data }) => {
  return (
    <Card className="chart-card">
      <Text className="chart-title">Tiến độ bỏ phiếu theo thời gian</Text>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorVote" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#95de64" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#95de64" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="votes"
            stroke="#52c41a"
            fillOpacity={1}
            fill="url(#colorVote)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default VoteProgressChart;
