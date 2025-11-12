import { BarChartOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SolutionOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';
import '../../../style/admin/ManagementRole.model.css'
import { useEffect } from 'react';

const { Title, Text } = Typography;

interface RoleStatsProps {
  data?: any
}

const RoleStats = ({ data }: RoleStatsProps) => {
    const stats = [
        { icon: <TeamOutlined style={{ fontSize: 20, color: '#1e4841' }} />, label: 'Vai trò', value: data.totalRole },
        { icon: <CheckCircleOutlined style={{ fontSize: 20, color: '#1e4841' }} />, label: 'Đang hoạt động', value: data.activeRole },
        { icon: <ExclamationCircleOutlined style={{ fontSize: 30, color: '#1e4841' }} />, label: 'Dừng hoạt động', value: data.inactiveRole },
    ];

    useEffect(() => {
      stats[0].value = data.totalRole;
      stats[1].value = data.activeRole;
      stats[2].value = data.inactiveRole;
    }, [data]);

    return (
        <div>
            <Row gutter={[16, 16]} justify="space-between">
                {stats.map((item, index) => (
                    <Col xs={24} sm={12} md={8} lg={8} key={index}>
                        <Card bordered={false} className="role-card">
                            <div className="role-icon" >{item.icon}</div>
                            <Title level={3} className="role-value" >
                                {item.value}
                            </Title>
                            <Text className="role-label">{item.label}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default RoleStats;
