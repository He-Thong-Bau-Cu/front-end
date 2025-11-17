import { Card, Typography } from "antd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../../../style/preside/ElectionResults.model.css";

const { Text } = Typography;

const DepartmentStats = ({ data }: any) => (
  <Card className="chart-card">
    <Text className="chart-title">Thống kê theo phòng ban</Text>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="department" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="votes" fill="#b7eb8f" />
      </BarChart>
    </ResponsiveContainer>
  </Card>
);

export default DepartmentStats;
