import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";

const { Title, Text } = Typography;
const { TextArea } = Input;

const GeneralSettings: React.FC = () => {
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = (info: UploadChangeParam<UploadFile>) => {
    const file = info.file;
    setFileName(file?.name ?? "");
  };

  return (
    // ❌ bỏ div settings-tabs-card
    <Card bordered={false} className="general-card settings-content-card">
      {/* Header nhỏ */}
      <div className="general-card-header">
        <span className="general-emoji" aria-hidden>
          🏠
        </span>
        <Title level={5} className="general-title">
          Cài đặt tổng quan
        </Title>
      </div>

      {/* Form */}
      <Form layout="vertical" className="general-form">
        <Form.Item
          label="Tên công ty"
          name="companyName"
          rules={[{ required: true, message: "Vui lòng nhập tên công ty" }]}
        >
          <Input placeholder="Công ty TNHH ABC" />
        </Form.Item>
        <Text type="secondary" className="general-help">
          Tên này sẽ hiển thị trên tất cả tài liệu và email
        </Text>

        <Form.Item label="Logo công ty" style={{ marginTop: 18 }}>
          <div className="upload-row">
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              showUploadList={false}
              onChange={handleFileChange}
            >
              <Button icon={<UploadOutlined />} className="btn-choose-file">
                Chọn file
              </Button>
            </Upload>
            {!!fileName && <span className="file-name">{fileName}</span>}
          </div>
        </Form.Item>

        <Text type="secondary" className="general-help">
          Định dạng PNG, JPG. Kích thước tối đa 2MB
        </Text>

        <Form.Item label="Thông tin liên hệ" style={{ marginTop: 18 }}>
          <TextArea
            placeholder="Địa chỉ; số điện thoại; email…"
            autoSize={{ minRows: 3, maxRows: 6 }}
          />
        </Form.Item>
      </Form>
    </Card>
  );
};

export default GeneralSettings;
