import { Input } from "antd";
import React from "react";

interface Props {
    value: string;
    onChange: (value: string) => void;
}

const DelegateSearch: React.FC<Props> = ({ value, onChange }) => {
    return (
        <Input.Search
            placeholder="🔎 Tìm kiếm đại biểu..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            allowClear
            style={{ marginBottom: 16, borderRadius: 8 }}
        />
    );
};

export default DelegateSearch;
