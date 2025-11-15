import { Button, Form, Input, Modal, message } from "antd";
import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import VoterService from "@/services/VoterService";
import UserService from "@/services/UserService";
import { BaseResponse } from "@/types/BaseResponse.interface";

interface Delegate {
    id: string;
    name: string;
    code: string;
    email?: string;
    unit?: string;
    role?: string;
}

interface Props {
    electionId: string;
    onAdd?: () => void;
}

const DelegateManualAdd: React.FC<Props> = ({ electionId, onAdd }) => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const openModal = () => {
        if (!electionId) {
            message.warning("Vui lòng chọn cuộc bầu cử trước");
            return;
        }
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        form.resetFields();
        setIsModalOpen(false);
    };

    const handleSubmit = async (values: any) => {
        if (!electionId) {
            message.error("Vui lòng chọn cuộc bầu cử");
            return;
        }

        try {
            setLoading(true);
            let userId: string | undefined;

            // Tìm user theo email
            if (values.email) {
                const userSearchResponse: BaseResponse<any> = await UserService.search({ 
                    email: values.email 
                });
                if (userSearchResponse.success && userSearchResponse.data?.content?.length > 0) {
                    const foundUser = userSearchResponse.data.content.find(
                        (u: any) => u.email === values.email
                    );
                    if (foundUser) {
                        userId = foundUser._id;
                    }
                }
            }

            // Nếu không tìm thấy user, tạo user mới
            if (!userId) {
                if (!values.email) {
                    message.error("Email là bắt buộc để tạo người dùng mới");
                    setLoading(false);
                    return;
                }

                // Tạo user mới (các field đã được validate bởi form)
                const createUserData = {
                    fullName: values.name,
                    email: values.email,
                    phone: values.phone,
                    citizenId: values.citizenId,
                    address: values.address,
                    position: values.role || "",
                    department: values.unit || "",
                };

                const createUserResponse: BaseResponse<any> = await UserService.create(createUserData);
                if (!createUserResponse.success) {
                    message.error(createUserResponse.message || "Không thể tạo người dùng");
                    setLoading(false);
                    return;
                }
                userId = createUserResponse.data._id;
            }

            // Kiểm tra userId trước khi tạo voter
            if (!userId) {
                message.error("Không thể xác định người dùng");
                setLoading(false);
                return;
            }

            // Tạo voter
            const createVoterResponse: any = await VoterService.create({
                electionId: electionId,
                userId: userId,
                eligible: true,
                status: "PENDING",
            });

            if (createVoterResponse.success) {
                message.success("✅ Tạo cử tri thành công");
                form.resetFields();
                setIsModalOpen(false);
                if (onAdd) {
                    onAdd();
                }
            } else {
                message.error(createVoterResponse.message || "Không thể tạo cử tri");
            }
        } catch (error: any) {
            console.error("Lỗi khi tạo cử tri:", error);
            message.error(error?.response?.data?.message || error?.message || "Đã xảy ra lỗi khi tạo cử tri");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: "#F9FDF9", padding: 20, borderRadius: 8 }}>
            <h4>👤 Thêm Thủ công</h4>
            <p>Thêm nhanh một đại biểu mới vào danh sách mà không cần file Excel</p>

            <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                    background: "#4CAF50",
                    borderColor: "#4CAF50",
                    fontWeight: 500,
                }}
                onClick={openModal}
            >
                Thêm Đại biểu mới
            </Button>

            <Modal
                title="Thêm Đại biểu mới"
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
                centered
                width={500}
                maskClosable={false}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ marginTop: 8 }}
                >
                    <Form.Item
                        name="name"
                        label="Họ và tên"
                        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                    >
                        <Input placeholder="VD: Nguyễn Văn A" />
                    </Form.Item>

                    <Form.Item
                        name="code"
                        label="Mã định danh"
                        rules={[{ message: "Vui lòng nhập mã định danh" }]}
                    >
                        <Input placeholder="VD: NV0015" />
                    </Form.Item>

                    <Form.Item 
                        name="email" 
                        label="Email"
                        rules={[{ type: "email", message: "Email không hợp lệ" }]}
                    >
                        <Input placeholder="example@email.com" />
                    </Form.Item>

                    <Form.Item 
                        name="phone" 
                        label="Số điện thoại"
                    >
                        <Input placeholder="VD: 0123456789" />
                    </Form.Item>

                    <Form.Item 
                        name="citizenId" 
                        label="Số căn cước công dân"
                    >
                        <Input placeholder="VD: 001234567890" />
                    </Form.Item>

                    <Form.Item 
                        name="address" 
                        label="Địa chỉ"
                    >
                        <Input placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM" />
                    </Form.Item>

                    <Form.Item name="unit" label="Đơn vị / Nhóm">
                        <Input placeholder="VD: Phòng Kinh doanh" />
                    </Form.Item>

                    <Form.Item name="role" label="Vai trò">
                        <Input placeholder="VD: Đại biểu / Cổ đông" />
                    </Form.Item>

                    <div style={{ textAlign: "right", marginTop: 12 }}>
                        <Button onClick={closeModal} style={{ marginRight: 8 }}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{
                                background: "#4CAF50",
                                borderColor: "#4CAF50",
                                fontWeight: 500,
                            }}
                        >
                            Lưu Đại biểu
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default DelegateManualAdd;
