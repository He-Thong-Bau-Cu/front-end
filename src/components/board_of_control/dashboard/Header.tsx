import React from "react";
import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { BKSUserInfo } from "../../../types/DashBoardBoardOfControl.interface";

interface Props {
  user: BKSUserInfo;
}

export default function Header({ user }: Props) {
  return (
    <div className="bks-header">
      <div className="bks-header-content">
        <h2 className="bks-title">Ban kiểm soát</h2>
        <p className="bks-subtitle">Giám sát bầu cử</p>
        <div className="bks-user">
          <Avatar size={64} icon={<UserOutlined />} />
          <div>
            <h4 className="bks-username">{user.name}</h4>
            <p className="bks-role">
              {user.role} — {user.department}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
