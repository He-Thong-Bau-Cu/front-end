import React, { useEffect, useState } from "react";
import { Modal, Descriptions, Tag, Avatar, Divider } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { STATUS_ROLE } from "@/enums/STATUS";
import FileService from "@/services/FileService";
import { formatDate, formatDateOfBirth } from "@/utils/format";
import { set } from "react-hook-form";

interface UserDetailModalProps {
  open: boolean;
  onCancel: () => void;
  userData: any;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  open,
  onCancel,
  userData,
}) => {
  const [srcAvt, setSrcAvt] = useState("");

  useEffect(() => {
    setSrcAvt("");
    if (userData) {
      fetchAvt();
    }
  }, [userData]);

  const fetchAvt = async () => {
    try {
      if (userData.image) {
        const avt = await FileService.getPresignedUrlByKey(userData.image);
        if (avt.success) {
          setSrcAvt(avt.data.url);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  if (!userData) return null;

  const getStatusTag = (status: string) =>
    status === STATUS_ROLE.ACTIVE ? (
      <Tag icon={<CheckCircleOutlined />} color="success">
        Hoạt động
      </Tag>
    ) : (
      <Tag icon={<CloseCircleOutlined />} color="error">
        Không hoạt động
      </Tag>
    );

  const getRoleColor = (roleId: string) => {
    const colors: Record<string, string> = {
      USER: "#1677ff",
      ADMIN: "#fa541c",
      PRESIDE: "#722ed1",
    };
    return colors[roleId] || "default";
  };

  return (
    <Modal
      open={open}
      closable={false} // Ẩn dấu X
      onCancel={onCancel}
      footer={null}
      width={520}
      centered
      maskClosable
      style={{ textAlign: "center" }} // Căn giữa toàn modal
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #f5f7fa 0%, #e6f4d9 100%)",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Avatar
          size={80}
          src={srcAvt}
          icon={<UserOutlined />}
          style={{
            backgroundColor: "#fff",
            color: "#1677ff",
            fontSize: 32,
            border: "2px solid #1677ff",
            marginBottom: 12,
          }}
        />
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
          {userData.fullName}
        </h2>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Tag
            color={getRoleColor(userData.roleId.roleCode)}
            style={{ fontSize: 12 }}
          >
            {userData.roleId.roleName}
          </Tag>
          {getStatusTag(userData.status)}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 28px" }}>
        {/* Thông tin liên lạc */}
        <Divider
          orientation="center"
          plain
          style={{ fontSize: 15, fontWeight: 600 }}
        >
          Thông tin cá nhân
        </Divider>

        <Descriptions
          column={2} // 👈 chia 2 cột
          size="small"
          bordered
          layout="vertical"
          colon={false}
          style={{ justifyContent: "center", textAlign: "center" }}
        >
          <Descriptions.Item
            label={
              <>
                <IdcardOutlined style={{ color: "#1677ff" }} /> Số CMND hoặc CCCD
              </>
            }
          >
            {userData.citizenId}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <EyeOutlined style={{ color: "#52c41a" }} /> Ngày sinh
              </>
            }
          >
            {formatDateOfBirth(userData.dateOfBirth)}
          </Descriptions.Item>
        </Descriptions>

        <Divider
          orientation="center"
          plain
          style={{ fontSize: 15, fontWeight: 600 }}
        >
          Thông tin liên lạc
        </Divider>

        <Descriptions
          column={2} // 👈 chia 2 cột
          size="small"
          bordered
          layout="vertical"
          colon={false}
          style={{ justifyContent: "center", textAlign: "center" }}
        >
          <Descriptions.Item
            label={
              <>
                <MailOutlined style={{ color: "#1677ff" }} /> Email
              </>
            }
          >
            {userData.email}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <>
                <PhoneOutlined style={{ color: "#52c41a" }} /> Số điện thoại
              </>
            }
          >
            {userData.phone}
          </Descriptions.Item>
        </Descriptions>

        {/* Thông tin công việc */}
        {(userData.position || userData.department) && (
          <>
            <Divider
              orientation="center"
              plain
              style={{ fontSize: 15, fontWeight: 600 }}
            >
              Thông tin công việc
            </Divider>

            <Descriptions
              column={2}
              size="small"
              bordered
              layout="vertical"
              colon={false}
              style={{ justifyContent: "center", textAlign: "center" }}
            >
              {userData.position && (
                <Descriptions.Item
                  label={
                    <>
                      <IdcardOutlined style={{ color: "#fa8c16" }} /> Chức vụ
                    </>
                  }
                >
                  {userData.position}
                </Descriptions.Item>
              )}

              {userData.department && (
                <Descriptions.Item
                  label={
                    <>
                      <TeamOutlined style={{ color: "#722ed1" }} /> Phòng ban
                    </>
                  }
                >
                  {userData.department}
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}

        {/* Ngày tạo */}
        {userData.createdAt && (
          <>
            <Divider
              orientation="center"
              plain
              style={{ fontSize: 15, fontWeight: 600 }}
            >
              Thông tin khác
            </Divider>

            <Descriptions
              column={2}
              size="small"
              bordered
              layout="vertical"
              colon={false}
              style={{ justifyContent: "center", textAlign: "center" }}
            >
              <Descriptions.Item label="Ngày tạo">
                {formatDate(userData.createdAt) || "—"}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </div>
    </Modal>
  );
};

export default UserDetailModal;
