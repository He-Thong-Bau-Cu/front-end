import { Button, Form, Input, Modal } from "antd";
import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";

interface Delegate {
    id: string;
    name: string;
    code: string;
    email?: string;
    unit?: string;
    role?: string;
}

interface Props {
    onAdd: (delegate: Delegate) => void;
}

const DelegateManualAdd: React.FC<Props> = ({ onAdd }) => {
    const [form] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        form.resetFields();
        setIsModalOpen(false);
    };

    const handleSubmit = (values: Delegate) => {
        onAdd({
            id: values.code,
            ...values,
        });
        form.resetFields();
        setIsModalOpen(false);
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
                        rules={[{ required: true, message: "Vui lòng nhập mã định danh" }]}
                    >
                        <Input placeholder="VD: NV0015" />
                    </Form.Item>

                    <Form.Item name="email" label="Email">
                        <Input placeholder="example@email.com" />
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
