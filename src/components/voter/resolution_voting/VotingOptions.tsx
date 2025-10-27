import React from "react";
import { Card, Radio, Space, Input, Button, Typography } from "antd";
import { OptionItem } from "./VotingTypes";
import "../../../style/voter/ResolutionVoting.model.css";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

interface Props {
  options: OptionItem[];
  selected: string | null;
  setSelected: (v: string) => void;
  comment: string;
  setComment: (v: string) => void;
  onSubmit: () => void;
}

const VotingOptions: React.FC<Props> = ({
  options,
  selected,
  setSelected,
  comment,
  setComment,
  onSubmit,
}) => {
  const handleSelect = (value: string) => {
    setSelected(value);
  };

  return (
    <Card bordered={false} className="resolution-card">
      <h5 className="section-title">Lựa chọn biểu quyết</h5>

      <Radio.Group
        onChange={(e) => handleSelect(e.target.value)}
        value={selected}
        style={{ width: "100%" }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {options.map((opt) => {
            const active = selected === opt.key ? "active" : "";
            return (
              <Card
                key={opt.key}
                onClick={() => handleSelect(opt.key)}
                className={`vote-option ${active} ${opt.key}`}
              >
                <Radio value={opt.key}>
                  <Space>
                    <span className={`icon ${opt.key}`}>{opt.icon}</span>
                    <Text strong>{opt.label}</Text>
                  </Space>
                </Radio>
                {opt.description && (
                  <Text type="secondary" style={{ display: "block" }}>
                    {opt.description}
                  </Text>
                )}
              </Card>
            );
          })}
        </Space>
      </Radio.Group>

      <TextArea
        rows={3}
        placeholder="Nếu cần, bạn có thể ghi chú ý kiến bổ sung..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="comment-box"
      />

      <div className="vote-form-buttons">
        <Button
          icon={<CloseOutlined />}
          className="cancel-btn"
          onClick={() => console.log("Hủy bỏ biểu quyết")}
        >
          Hủy bỏ
        </Button>

        <Button
          icon={<CheckOutlined />}
          onClick={onSubmit}
          disabled={!selected}
          className={`confirm-btn ${selected ? "active" : ""}`}
        >
          Xác nhận biểu quyết
        </Button>
      </div>
    </Card>
  );
};

export default VotingOptions;
