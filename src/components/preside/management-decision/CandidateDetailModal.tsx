import React from "react";
import {
  Modal,
  Typography,
  Descriptions,
  Image,
  Tag,
  Divider,
} from "antd";

const { Title, Paragraph, Text } = Typography;

interface CandidateDetailModalProps {
  open: boolean;
  onClose: () => void;
  data?: any;
}

const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  open,
  onClose,
  data,
}) => {
  if (!data) return null;
  const meta = data.metaData || {};
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={820}
      styles={{
        body: {
          padding: 0,
          background: "#f3f8f4",
          borderRadius: 10,
        },
      }}
    >
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg, #7CCB8F, #A8E6A1)",
          padding: "40px 20px 50px",
          borderRadius: "10px 10px 0 0",
          textAlign: "center",
        }}
      >
        <Image
          src={meta.urlImage}
          width={130}
          height={130}
          preview={false}
          style={{
            objectFit: "cover",
            borderRadius: "50%",
            border: "4px solid #ffffffaa",
            background: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
          }}
          fallback="/no-image.png"
        />

        <Title
          level={3}
          style={{
            marginTop: 14,
            color: "#fff",
            fontWeight: 700,
          }}
        >
          {data.fullName || meta.fullName || "Ứng viên"}
        </Title>

        {(data.position || meta.position) && (
          <Text
            style={{
              color: "#fefefe",
              fontSize: 15,
              opacity: 0.9,
            }}
          >
            {data.position || meta.position}
          </Text>
        )}
      </div>

      {/* CONTENT */}
      <div style={{ marginTop: -25, padding: "0 22px" }}>
        <div
          style={{
            background: "#fff",
            padding: "22px 26px",
            borderRadius: 12,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            border: "1px solid #e6f2e8",
          }}
        >
          <Title level={4} style={{ marginBottom: 12, color: "#3E6C45" }}>
            Thông tin cá nhân
          </Title>

          <Descriptions
            column={2}
            styles={{
              label: { fontWeight: 600 },
              content: { fontSize: 14 },
            }}
          >
            <Descriptions.Item label="Họ và tên">
              {data.fullName || meta.fullName}
            </Descriptions.Item>

            <Descriptions.Item label="Tuổi">
              {meta.age || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Phòng ban">
              {meta.department || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Chức vụ">
              {meta.position || data.position || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Kinh nghiệm" span={2}>
              {meta.experience || "-"}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={5} style={{ marginBottom: 10, color: "#3E6C45" }}>
            Thành tích
          </Title>

          <Paragraph style={{ whiteSpace: "pre-line" }}>
            {meta.achievements || "Chưa cập nhật thành tích."}
          </Paragraph>
        </div>
      </div>
    </Modal>
  );
};

export default CandidateDetailModal;
