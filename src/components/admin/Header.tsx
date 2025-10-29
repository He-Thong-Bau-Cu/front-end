import React from 'react';
import { Avatar, Badge, Layout } from 'antd';
import { BellFilled } from '@ant-design/icons';


const { Header } = Layout;

interface AdminHeaderProps {
    title: string;
}
const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
    return (
        <Header
            style={{
                height: 100,
                background: '#ECF4E9',
                position: 'fixed',
                left: 290,
                right: 0,
                top: 0,
                zIndex: 10,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                fontSize: '1.25rem',
                fontWeight: 600,
                borderLeft: '5px solid #c41d1d',
                width: `calc(100% - 260px)`,
            }}
        >
            <div style={{ paddingLeft: '50px', fontWeight: '700', fontSize: '25px', color: '#124d2d', display: 'flex' }}>
                <div style={{ width: '1300px' }}>{title}</div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Thông báo */}
                    <Badge count={3} size="small">
                        <BellFilled style={{ fontSize: 22, color: '#c41d1d', cursor: 'pointer' }} />
                    </Badge>

                    {/* Avatar Admin */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar
                            style={{
                                backgroundColor: '#c41d1d',
                                verticalAlign: 'middle',
                            }}
                            size="large"
                        >
                            A
                        </Avatar>
                        <span style={{ fontWeight: 600, color: '#333' }}>Admin</span>
                    </div>
                </div>
            </div>



        </Header>
    );
};

export default AdminHeader;
