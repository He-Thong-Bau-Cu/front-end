import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React from "react";

const DelegateUpload: React.FC = () => {
    return (
        <div className="delegate-upload" style={{ padding: 20, border: "1px dashed #ccc", borderRadius: 8 }}>
            <h4>📁 Nhập từ File</h4>
            <p>Kéo và thả file Excel hoặc CSV vào đây</p>
            <Upload.Dragger multiple={false} showUploadList={false}>
                <Button type="primary" icon={<UploadOutlined />}>
                    Chọn file từ máy tính
                </Button>
            </Upload.Dragger>
            <p style={{ marginTop: 8, color: "#007bff", cursor: "pointer" }}>
                Tải file mẫu (.xlsx) để đảm bảo đúng định dạng
            </p>
        </div>
    );
};

export default DelegateUpload;
