import "../../style/HomePage.model.css";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Button,
  Form,
  Input,
  Modal,
  Space,
  Typography,
  Upload,
  message,
  Switch,
  Col,
  Row,
  Progress,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  BellOutlined,
  PictureOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  FileProtectOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import { User } from "@/types/User.interface";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import UserService from "@/services/UserService";
import FileService from "@/services/FileService";
import { FILE_TYPE } from "@/enums/FILE_TYPE";
import CaService from "@/services/CaService";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  handleCloseProfile: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose, user, handleCloseProfile }) => {
  const [activeTab, setActiveTab] = useState<
    "info" | "avatar" | "security" | "notification" | "certificate"
  >("info");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [infoForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [certificateForm] = Form.useForm();
  const [u, setU] = useState<User | null>(null);
  const hasCa = !!((u as any)?.signCa && (((u as any)?.issueCa) || ((u as any)?.issueCA)));
  useEffect(() => {
    if (user) {
      setU(user);
      certificateForm.setFieldsValue({
        ...(user as any),
        countryName: "VN",
      });
    }
  }, [user, certificateForm]);

  const handleDownloadCa = async () => {
    try {
      if (!u?.signCa) {
        notify("Không tìm thấy chứng thư số", "warning");
        return;
      }
      showLoading();
      const blob = await FileService.getSignedFile(u.signCa);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "certificate.p12";
      link.click();
      setTimeout(() => window.URL.revokeObjectURL(url), 500);
      notify("Đang tải chứng thư số", "success");
    } catch (error: any) {
      console.error(error);
      notify("Không thể tải chứng thư số", "error");
    } finally {
      hideLoading();
    }
  };


  // Tính độ mạnh của mật khẩu
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    return score;
  };



  // Lấy màu theo độ mạnh
  const getStrengthColor = () => {
    if (passwordStrength < 40) return "#ff4d4f"; // yếu
    if (passwordStrength < 70) return "#faad14"; // trung bình
    return "#52c41a"; // mạnh
  };

  // Lấy text mô tả
  const getStrengthText = () => {
    if (passwordStrength < 40) return "Yếu";
    if (passwordStrength < 70) return "Trung bình";
    return "Mạnh";
  };

  const handleUploadChange = (info: UploadChangeParam<UploadFile<any>>) => {
    setFileList(info.fileList.slice(-1));
    notify("Ảnh đã được tải lên tạm thời", "info");
  };

  /** Xử lý lưu form */
  const handleSubmit = async () => {
    try {
      showLoading();

      if (activeTab === "certificate") {
        const values = await certificateForm.validateFields();
        let signerInfo = {
          commonName: values.fullName,
          organizationName: values.organizationName,
          countryName: 'VN',
          stateOrProvinceName: values.stateOrProvinceName,
          localityName: values.address,
          emailAddress: values.email,
        }
        const password = values.passwordCa;
        const body = { signerInfo, password };
        const response = await CaService.CaIssue(body);
        if (response.success) {
          notify(response.message, "success");
        } else {
          notify(response.message, "error");
        }
      }

      if (activeTab === "info") {
        const values = await infoForm.validateFields();
        let body = {
          ...values,
        }
        const userId = localStorage.getItem("userId") as string;
        const response = await UserService.update(userId, body);
        if (response.success) {
          notify(response.message, "success");
        } else {
          notify(response.message, "error");
        }
      }

      if (activeTab === "avatar") {
        const response = await UserService.uploadAvatar(fileList[0].originFileObj as File);
        if (response.success) {
          notify(response.message, "success");
        } else {
          notify(response.message, "error");
        }
      }

      if (activeTab === "security") {
        const values = await securityForm.validateFields();
        if (values.newPassword !== values.confirmPassword) {
          message.error("Mật khẩu xác nhận không khớp!");
          return;
        }
        let body = {
          userId: localStorage.getItem("userId") as string,
          oldPassword: values.currentPassword,
          newPassword: values.newPassword
        }
        const response = await UserService.changePassword(body);
        if (response.success) {
          notify(response.message, "success");
        } else {
          notify(response.message, "error");
        }
      }
    } catch (err) {
      console.error(err);
      message.error("Vui lòng kiểm tra lại thông tin!");
    } finally {
      hideLoading();
      handleCloseProfile();
    }
  };

  const tabs = [
    { key: "info", label: "Thông tin Cá nhân", icon: <UserOutlined /> },
    { key: "avatar", label: "Ảnh Đại diện", icon: <PictureOutlined /> },
    { key: "security", label: "Bảo mật", icon: <LockOutlined /> },
    { key: "certificate", label: "Đăng ký Chứng thư số", icon: <FileProtectOutlined /> },
    // { key: "notification", label: "Cài đặt Thông báo", icon: <BellOutlined /> },
  ];

  const fadeMotion = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.25 },
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={660}
      centered
      className="profile-modal"
      style={{
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          minHeight: 460,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            width: 200,
            background: "#ecf4e9",
            borderRight: "1px solid #dceadc",
            padding: "20px 10px",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }}>
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                icon={tab.icon}
                onClick={() => setActiveTab(tab.key as any)}
                block
                type={activeTab === tab.key ? "primary" : "text"}
                style={{
                  textAlign: "left",
                  justifyContent: "flex-start",
                  borderRadius: 8,
                  background: activeTab === tab.key ? "#5C9D52" : "transparent",
                  color: activeTab === tab.key ? "#fff" : "#124d2d",
                  fontWeight: 500,
                  transition: "all 0.25s ease",
                  height: 40,
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Space>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            padding: "0px 32px",
            minHeight: 470,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <AnimatePresence mode="wait">
            {activeTab === "info" && (
              <motion.div key="info" {...fadeMotion}>
                <Title level={4}>Thông tin cá nhân</Title>
                <Form
                  layout="vertical"
                  form={infoForm}
                  initialValues={user || {}}
                  style={{ marginTop: 10 }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[{ required: true, message: "Nhập họ tên!" }]}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item label="Email" name="email">
                        <Input disabled />
                      </Form.Item>
                      <Form.Item label="Số điện thoại" name="phone">
                        <Input />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item label="Căn cước công dân" name="citizenId">
                        <Input />
                      </Form.Item>
                      <Form.Item label="Chức vụ" name="position">
                        <Input />
                      </Form.Item>
                      <Form.Item label="Phòng ban" name="department">
                        <Input />
                      </Form.Item>
                      <Form.Item label="Địa chỉ" name="address">
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
                <div style={{ textAlign: "right", marginTop: 16 }}>
                  <Button
                    type="primary"
                    className="btn-save"
                    onClick={handleSubmit}
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "avatar" && (
              <motion.div
                key="avatar"
                {...fadeMotion}
                style={{ textAlign: "center" }}
              >
                <Avatar
                  size={250}
                  src={user?.image}
                  icon={user?.imageKey ? <UserOutlined /> : undefined}
                  style={{
                    backgroundColor: "#eaf5ea",
                    marginTop: 20,
                    marginBottom: 35,
                  }}
                />

                <div
                  style={{ display: "flex", justifyContent: "center", gap: 12 }}
                >
                  <Upload
                    listType="picture"
                    maxCount={1}
                    fileList={fileList}
                    onChange={handleUploadChange}
                    beforeUpload={() => false}
                  >
                    <Button icon={<PictureOutlined />}>Tải ảnh mới</Button>
                  </Upload>
                  <Button danger>Xóa ảnh</Button>
                </div>

                <p style={{ color: "gray", marginTop: 16 }}>
                  Ảnh JPG, PNG hoặc GIF. Dung lượng tối đa 5MB.
                </p>
                <div style={{ textAlign: "right", marginTop: 30 }}>
                  <Button
                    type="primary"
                    className="btn-save"
                    onClick={handleSubmit}
                  >
                    Lưu thay đổi
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div key="security" {...fadeMotion}>
                <Title style={{ marginTop: 4 }} level={4}>
                  Bảo mật tài khoản
                </Title>
                <Form
                  layout="vertical"
                  form={securityForm}
                  style={{ marginTop: 16 }}
                >
                  <Form.Item
                    label={
                      <Text strong style={{ color: "#333", fontSize: "14px" }}>
                        Mật khẩu hiện tại
                      </Text>
                    }
                    name="currentPassword"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mật khẩu hiện tại!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#bbb" }} />}
                      placeholder="Nhập mật khẩu tạm thời"
                      size="large"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                      style={{ borderRadius: "8px", height: "44px" }}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <Text strong style={{ color: "#333", fontSize: "14px" }}>
                        Mật khẩu mới
                      </Text>
                    }
                    name="newPassword"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mật khẩu mới!",
                      },
                      { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
                      {
                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message:
                          "Mật khẩu phải chứa chữ hoa, chữ thường và số!",
                      },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#bbb" }} />}
                      placeholder="Nhập mật khẩu mới"
                      size="large"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                      style={{ borderRadius: "8px", height: "44px" }}
                      onChange={(e) =>
                        setPasswordStrength(
                          calculatePasswordStrength(e.target.value)
                        )
                      }
                    />
                  </Form.Item>

                  {securityForm.getFieldValue("newPassword") && (
                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "6px",
                        }}
                      >
                        <Text style={{ fontSize: "13px", color: "#666" }}>
                          Độ mạnh mật khẩu:
                        </Text>
                        <Text
                          style={{
                            fontSize: "13px",
                            color: getStrengthColor(),
                            fontWeight: "500",
                          }}
                        >
                          {getStrengthText()}
                        </Text>
                      </div>
                      <Progress
                        percent={passwordStrength}
                        strokeColor={getStrengthColor()}
                        showInfo={false}
                        style={{ marginBottom: "4px" }}
                      />
                    </div>
                  )}

                  <Form.Item
                    label={
                      <Text strong style={{ color: "#333", fontSize: "14px" }}>
                        Xác nhận mật khẩu mới
                      </Text>
                    }
                    name="confirmPassword"
                    dependencies={["newPassword"]}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng xác nhận mật khẩu mới!",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (
                            !value ||
                            getFieldValue("newPassword") === value
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Mật khẩu xác nhận không khớp!")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: "#bbb" }} />}
                      placeholder="Xác nhận mật khẩu"
                      size="large"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                      style={{ borderRadius: "8px", height: "44px" }}
                    />
                  </Form.Item>

                  <div style={{ textAlign: "right", paddingTop: 20 }}>
                    <Button
                      type="primary"
                      className="btn-save"
                      onClick={handleSubmit}
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                </Form>
              </motion.div>
            )}

            {activeTab === "notification" && (
              <motion.div key="notification" {...fadeMotion}>
                <Title level={5}>Cài đặt Thông báo</Title>
                <Form
                  layout="vertical"
                  form={notificationForm}
                  style={{ marginTop: 16 }}
                  initialValues={{ emailNotify: true, smsNotify: false }}
                >
                  <Form.Item
                    label="Thông báo qua Email"
                    name="emailNotify"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <Form.Item
                    label="Thông báo qua SMS"
                    name="smsNotify"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                  <div style={{ textAlign: "right" }}>
                    <Button
                      type="primary"
                      className="btn-save"
                      onClick={handleSubmit}
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                </Form>
              </motion.div>
            )}

            {activeTab === "certificate" && (
              <motion.div key="certificate" {...fadeMotion}>
                <Title level={4} style={{ color: "#124d2d" }}>
                  Đăng ký Chứng thư số
                </Title>

                {!(u?.signCa && u?.issueCa) ? (
                  <>
                    <Form layout="vertical" form={certificateForm}
                      initialValues={user || {}}
                      style={{ marginTop: 20 }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item
                            label="Tên định danh"
                            name="fullName"
                            rules={[{ required: true, message: "Nhập họ và tên" }]}
                          >
                            <Input value={u?.fullName} disabled />
                          </Form.Item>
                          <Form.Item label="Địa chỉ email"
                            rules={[{ required: true, message: "Nhập email" }]}
                            name="email">
                            <Input value={u?.email} disabled />
                          </Form.Item>

                          <Form.Item label="Địa chỉ"
                            name="address"
                            rules={[{ required: true, message: "Nhập địa chỉ" }]}
                          >
                            <Input value={u?.address} />
                          </Form.Item>

                          <Form.Item
                            label="Quốc gia"
                            name="countryName"
                            rules={[{ required: true, message: "Nhập tên quốc gia!" }]}
                            initialValue="VN"
                          >
                            <Input disabled />
                          </Form.Item>

                        </Col>

                        <Col span={12}>
                          <Form.Item
                            label="Tổ chức"
                            name="organizationName"
                            rules={[{ required: true, message: "Nhập tên tổ chức" }]}
                          >
                            <Input placeholder="VD:  " />
                          </Form.Item>
                          <Form.Item
                            label="Tỉnh/Thành phố"
                            name="stateOrProvinceName"
                            rules={[{ required: true, message: "Nhập quốc tịch" }]}
                          >
                            <Input placeholder="VD: Hà Nội" />
                          </Form.Item>
                          <Form.Item
                            label="Quận/Huyện"
                            name="localityName"
                            rules={[{ required: true, message: "Nhập Quận/Huyện" }]}
                          >
                            <Input placeholder="VD: Thạch Thất" />
                          </Form.Item>


                          <Form.Item
                            label="Mật khẩu chứng thư"
                            name="passwordCa"
                            rules={[{ required: true, message: "Nhập mật khẩu chứng thư!" }]}
                          >
                            <Input.Password placeholder="********" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>

                    <div style={{ textAlign: "right", marginTop: 16 }}>
                      <Button
                        type="primary"
                        onClick={handleSubmit}
                        style={{
                          background: "#5C9D52",
                          border: "none",
                          fontWeight: 600,
                        }}
                      >
                        Đăng ký chứng thư số
                      </Button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "right", marginTop: 16 }}>
                    <Button
                      type="primary"
                      onClick={handleDownloadCa}
                      style={{
                        background: "#5C9D52",
                        border: "none",
                        fontWeight: 600,
                      }}
                    >
                      Tải chứng thư số
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
