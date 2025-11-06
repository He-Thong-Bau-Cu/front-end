import '../../style/HomePage.model.css'
import React, { useState } from "react";
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
} from "antd";
import {
    UserOutlined,
    LockOutlined,
    BellOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import type { UploadChangeParam } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";
import { User } from "@/types/User.interface";

const { Title } = Typography;

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
    user: User | null;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose, user }) => {
    const [activeTab, setActiveTab] = useState<
        "info" | "avatar" | "security" | "notification"
    >("info");
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const handleUploadChange = (info: UploadChangeParam<UploadFile<any>>) => {
        setFileList(info.fileList.slice(-1));
        message.success("Ảnh đã được tải lên tạm thời");
    };

    const tabs = [
        { key: "info", label: "Thông tin Cá nhân", icon: <UserOutlined /> },
        { key: "avatar", label: "Ảnh Đại diện", icon: <PictureOutlined /> },
        { key: "security", label: "Bảo mật", icon: <LockOutlined /> },
        { key: "notification", label: "Cài đặt Thông báo", icon: <BellOutlined /> },
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
                    // background: "linear-gradient(180deg, #f8fdf8, #ffffff)",
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
                                    background:
                                        activeTab === tab.key ? "#5C9D52" : "transparent",
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
                        minHeight: 470, // 👈 chiều cao cố định tối thiểu
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}>
                    <AnimatePresence mode="wait">
                        {activeTab === "info" && (
                            <motion.div key="info" {...fadeMotion}>
                                <Title level={4}>Thông tin cá nhân</Title>
                                <Form layout="vertical" style={{ marginTop: 10 }}>
                                    <Form.Item label="Họ và tên">
                                        <Input defaultValue={user?.fullName} />
                                    </Form.Item>
                                    <Form.Item label="Email">
                                        <Input defaultValue={user?.email} disabled />
                                    </Form.Item>
                                    <Form.Item label="Số điện thoại">
                                        <Input defaultValue={user?.phone} />
                                    </Form.Item>
                                    <Form.Item label="Địa chỉ">
                                        <Input defaultValue={user?.address} />
                                    </Form.Item>

                                </Form>
                                <div style={{ textAlign: "right", marginTop: 16 }}>
                                    <Button onClick={onClose} style={{ marginRight: 8 }}>
                                        Hủy
                                    </Button>
                                    <Button type="primary" className="btn-save">
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "avatar" && (
                            <motion.div key="avatar" {...fadeMotion} style={{ textAlign: "center" }}>
                                <div>
                                    <Avatar
                                        size={250}
                                        src={user?.image}
                                        icon={!user?.image ? <UserOutlined /> : undefined}
                                        style={{
                                            backgroundColor: "#eaf5ea",
                                            marginTop: 20,
                                            marginBottom: 35,
                                        }}
                                    />
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 12, // khoảng cách giữa 2 nút
                                    }}
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
                                    <Button onClick={onClose} style={{ marginRight: 8 }}>
                                        Hủy
                                    </Button>
                                    <Button type="primary" className="btn-save">
                                        Lưu thay đổi
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "security" && (
                            <motion.div key="security" {...fadeMotion}>
                                <Title style={{ marginTop: 4 }} level={4}>Bảo mật tài khoản</Title>
                                <Form layout="vertical" style={{ marginTop: 16 }}>
                                    <Form.Item label="Mật khẩu hiện tại">
                                        <Input.Password placeholder="••••••••" />
                                    </Form.Item>
                                    <Form.Item label="Mật khẩu mới">
                                        <Input.Password placeholder="••••••••" />
                                    </Form.Item>
                                    <Form.Item label="Xác nhận mật khẩu mới">
                                        <Input.Password placeholder="••••••••" />
                                    </Form.Item>
                                    <div style={{ textAlign: "right", paddingTop: 50 }}>
                                        <Button type="primary" className="btn-save">
                                            Lưu thay đổi
                                        </Button>
                                    </div>
                                </Form>
                            </motion.div>
                        )}

                        {activeTab === "notification" && (
                            <motion.div key="notification" {...fadeMotion}>
                                <Title level={5}>Cài đặt Thông báo</Title>
                                <Form layout="vertical" style={{ marginTop: 16 }}>
                                    <Form.Item label="Thông báo qua Email">
                                        <Switch defaultChecked /> Bật
                                    </Form.Item>
                                    <Form.Item label="Thông báo qua SMS">
                                        <Switch /> Tắt
                                    </Form.Item>
                                    <div style={{ textAlign: "right" }}>
                                        <Button type="primary" className="btn-save">
                                            Lưu thay đổi
                                        </Button>
                                    </div>
                                </Form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </Modal>
    );
};

export default ProfileModal;
