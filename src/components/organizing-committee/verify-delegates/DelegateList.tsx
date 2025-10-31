import { Input, List } from "antd";
import React from "react";

interface Delegate {
    id: string;
    name: string;
    code?: string;
    unit?: string;
    email?: string;
    type?: string;
    status?: string;
}

// 💡 Props của component
interface DelegateListProps {
    delegates: Delegate[];
    selectedId: string;
    onSelect: (delegate: Delegate) => void;
}
const DelegateList: React.FC<DelegateListProps> = ({
    delegates,
    selectedId,
    onSelect,
}) => {
    return (
        <div className="delegate-list">
            <h3 className="delegate-title">Xác thực Đại biểu</h3>
            <Input.Search placeholder="Tìm theo tên, mã định danh, email..." allowClear />

            <List
                dataSource={delegates}
                renderItem={(item) => (
                    <List.Item
                        onClick={() => onSelect(item)}
                        className={`delegate-item ${selectedId === item.id ? "selected" : ""
                            }`}
                    >
                        <div>
                            <strong>{item.name}</strong>
                            <p className="delegate-code">Mã ĐB: {item.id}</p>
                        </div>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default DelegateList;
