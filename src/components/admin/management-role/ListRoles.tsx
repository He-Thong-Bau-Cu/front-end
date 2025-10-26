import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Col, Row, Table, Tag, Typography } from 'antd';
import { TableProps } from 'antd/lib';
import '../../../style/admin/ManagementRole.model.css';
import type { RoleRecord } from "../../../types/Role.interface";

const { Text } = Typography;



const ListRoles = () => {
    const columns: TableProps<RoleRecord>["columns"] = [
        {
            title: 'VAI TRÒ',
            dataIndex: 'role',
            key: 'role',
            render: (text: string, record) => (
                <div className="role-item">
                    <div className="role-dot" />
                    <div>
                        <Text strong>{record.role}</Text>
                        <div className="role-desc">{record.desc}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'NGƯỜI DÙNG',
            dataIndex: 'users',
            key: 'users',
            render: (num) => <Tag className="role-tag">{num}</Tag>,
        },
        {
            title: 'QUYỀN HẠN',
            dataIndex: 'permissions',
            key: 'permissions',
            render: (num) => <Tag className="role-tag">{num}</Tag>,
        },
        {
            title: 'HÀNH ĐỘNG',
            key: 'action',
            render: () => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        className="role-edit-btn"
                    />
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        className="role-delete-btn"
                    />
                </div>
            ),
        },
    ];

    const data: RoleRecord[] = [
        { key: 1, role: 'Quản trị hệ thống', desc: 'Quản trị toàn bộ hệ thống', users: 3, permissions: 25 },
        { key: 2, role: 'Ban giám sát', desc: 'Giám sát và điều hành bầu cử', users: 12, permissions: 18 },
        { key: 3, role: 'Cử tri', desc: 'Cử tri tham gia bỏ phiếu', users: 1089, permissions: 8 },
        { key: 4, role: 'Chủ tọa', desc: 'Theo dõi và giám sát bầu cử', users: 8, permissions: 6 },
    ];

    return (
        <div className="role-section">
            <Row gutter={24}>
                {/* Left: Role Table */}
                <Col xs={24} lg={14}>
                    <Card
                        title={
                            <div className="role-card-header">
                                <Text strong className="role-card-title">
                                    📋 Danh sách vai trò
                                </Text>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    className="role-add-btn"
                                >
                                    Thêm mới
                                </Button>
                            </div>
                        }
                        bodyStyle={{ padding: 0 }}
                        className="role-card"
                    >
                        <Table<RoleRecord>
                            rowKey="key"
                            columns={columns}
                            dataSource={data}
                            pagination={false}
                            className="role-table"
                        />


                    </Card>
                </Col>

                {/* Right: Permissions */}
                <Col xs={24} lg={10}>
                    <Card
                        title={
                            <div className='permission-card'>
                                <Text strong className="permission-title">📜 Quyền hạn</Text>
                            </div>
                        }
                        className="permission-card"
                    >
                        <div className="permission-placeholder">
                            <span>👉</span>
                            <Text>Chọn một vai trò để xem và chỉnh sửa quyền hạn</Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ListRoles;
