import React from 'react';
import { Avatar, Badge, Layout } from 'antd';
import { BellFilled } from '@ant-design/icons';
import '../../style/Header.model.css';

const { Header } = Layout;

interface VoterHeaderProps {
    title: string;
}

const VoterHeader: React.FC<VoterHeaderProps> = ({ title }) => {
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
                        <span className="header-username">Voter</span>
                    </div>
                </div>
            </div>
        </Header>
    );
};

export default VoterHeader;



