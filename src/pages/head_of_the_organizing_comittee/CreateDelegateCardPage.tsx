import React, { useState } from "react";
import {
  Card, Row, Col, Form, Input, Button, Divider, Typography,
} from "antd";
import {
  DownloadOutlined, SendOutlined,
} from "@ant-design/icons";
import SectionTitle from "../../components/head_of_the_organizing_committee/Issuing_delegate_cards/SectionTitle";
import ModeSelector from "../../components/head_of_the_organizing_committee/Issuing_delegate_cards/ModeSelector";
import AccessMethodSelector from "../../components/head_of_the_organizing_committee/Issuing_delegate_cards/AccessMethodSelector";
import "../../style/head-of-the-organizing-committee/CreateDelegateCard.model.css";

const { Text } = Typography;

export type IssueMode = "bulk" | "single";
export type AccessMethod = "qr_pin" | "qr_only";

export interface DelegateCardOptions {
  meetingName: string;
  mode: IssueMode;
  keyword?: string;
  accessMethod: AccessMethod;
}

export default function CreateDelegateCardPage() {
  const [options, setOptions] = useState<DelegateCardOptions>({
    meetingName: "Bầu cử Hội đồng Quản trị 2025",
    mode: "bulk",
    accessMethod: "qr_pin",
  });

  return (
    <div className="dc-page">
      <Row gutter={16} className="dc-row">
        {/* LEFT FORM */}
        <Col xs={24} lg={16}>
          <Card className="dc-card">
            {/* 1. Chọn Sự kiện & Chế độ */}
            <SectionTitle index={1} title="Chọn Sự kiện & Chế độ" />
            <Form layout="vertical">
              <Form.Item label="Cuộc họp / Bầu cử">
                <Input value={options.meetingName} disabled className="dc-disabled-input" />
              </Form.Item>

              <Form.Item label="Chế độ tạo">
                <ModeSelector
                  value={options.mode}
                  onChange={(v) => setOptions((o) => ({ ...o, mode: v }))}
                />
              </Form.Item>

              <Form.Item>
                <Input
                  placeholder="Tìm kiếm tên hoặc mã đại biểu..."
                  disabled={options.mode === "bulk"}
                  allowClear
                  onChange={(e) =>
                    setOptions((o) => ({ ...o, keyword: e.target.value }))
                  }
                />
              </Form.Item>
            </Form>

            <Divider className="dc-divider" />

            {/* 2. Tùy chỉnh Thẻ */}
            <SectionTitle index={2} title="Tùy chỉnh Thẻ" />
            <Form layout="vertical">
              <Form.Item label="Phương thức truy cập">
                <AccessMethodSelector
                  value={options.accessMethod}
                  onChange={(v) =>
                    setOptions((o) => ({ ...o, accessMethod: v }))
                  }
                />
              </Form.Item>
            </Form>

            <Divider className="dc-divider" />

            {/* 3. Hành động */}
            <SectionTitle index={3} title="Hành động" />
            <div className="dc-actions">
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                className="dc-btn-primary"
                block
              >
                Phát hành & Tải xuống (PDF)
              </Button>
              <Button
                icon={<SendOutlined />}
                className="dc-btn-secondary"
                block
              >
                Phát hành & Gửi Email
              </Button>
              <Text type="secondary" className="dc-note">
                * Email sẽ gửi theo thông tin liên hệ của đại biểu trên hệ thống.
              </Text>
            </div>
          </Card>
        </Col>

        {/* RIGHT PREVIEW */}
        <Col xs={24} lg={8}>
          <Card className="dc-preview-wrap">
            <Row justify="center">
              <Col span={24}>
                <div className="dc-preview-title-sub">Thẻ tham dự sự kiện</div>
                <div className="dc-preview-title-main">{options.meetingName}</div>
                <Divider className="dc-preview-divider" />
              </Col>
            </Row>

            <Row justify="center">
              <Col span={24}>
                <div className="dc-person-name">Nguyễn Văn An</div>
                <div className="dc-person-id">Mã định danh: NV0123</div>

                <div className="dc-pin-row">
                  <div className="dc-qr-box" />
                  <div className="dc-pin-box">
                    <div className="dc-pin-label">Mã PIN của bạn:</div>
                    <div className="dc-pin-value">6821</div>
                  </div>
                </div>

                <div className="dc-instruction">
                  Vui lòng sử dụng mã QR hoặc mã PIN để check-in và bỏ phiếu.
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
