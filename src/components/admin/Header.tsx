import React from 'react';
import { Avatar, Badge, Layout } from 'antd';
import { BellFilled } from '@ant-design/icons';
import '../../style/Header.model.css';

const { Header } = Layout;

interface AdminHeaderProps {
    title: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
    return (
        <Header className="secretary-header">
            <div className="header-container">
                {/* Tiêu đề */}
                <div className="header-title">{title}</div>

                {/* Thông báo + Avatar */}
                <div className="header-actions">
                    <Badge count={3} size="small">
                        <BellFilled className="header-icon" />
                    </Badge>

                    <div className="header-user">
                        <Avatar className="header-avatar" size="large">
                            A
                        </Avatar>
                        <span className="header-username">Admin</span>
                    </div>
                </div>
            </div>
        </Header>
    );
};

export default AdminHeader;


