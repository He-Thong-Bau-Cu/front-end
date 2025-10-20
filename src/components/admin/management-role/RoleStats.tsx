import { BarChartOutlined, SolutionOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { Card, Col, Row, Typography } from 'antd';
import '../../../style/admin/ManagementRole.model.css'

const { Title, Text } = Typography;

const RoleStats = () => {
    const stats = [
        { icon: <TeamOutlined style={{ fontSize: 30, color: '#1e4841' }} />, label: 'Vai trò', value: '4' },
        { icon: <UserOutlined style={{ fontSize: 30, color: '#1e4841' }} />, label: 'Người dùng', value: '1,112' },
        { icon: <SolutionOutlined style={{ fontSize: 30, color: '#1e4841' }} />, label: 'Quyền hạn', value: '57' },
        { icon: <BarChartOutlined style={{ fontSize: 30, color: '#1e4841' }} />, label: 'Hoạt động', value: '85%' },
    ];

    return (
        <div>
            <Row gutter={[16, 16]} justify="space-between">
                {stats.map((item, index) => (
                    <Col xs={24} sm={12} md={12} lg={6} key={index}>
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