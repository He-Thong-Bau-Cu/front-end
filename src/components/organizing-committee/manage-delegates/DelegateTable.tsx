import React, { useEffect, useState } from "react";
import { Table, Button, Space, Spin, message, Modal, Form, Input } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import VoterService from "@/services/VoterService";
import UserService from "@/services/UserService";
import { BaseResponse } from "@/types/BaseResponse.interface";

interface Delegate {
    id: string;
    name: string;
    code: string;
    email: string;
    unit: string;
    role: string;
}

interface Props {
    electionId: string;
    searchResults?: VoterData[] | null; // Kết quả tìm kiếm từ component cha
}

interface VoterData {
    _id: string;
    userId: {
        _id: string;
        fullName: string;
        email: string;
        username: string;
        position?: string;
        department?: string;
    };
    status?: string;
}

const DelegateTable: React.FC<Props> = ({ electionId, searchResults }) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<Delegate[]>([]);
    const [votersData, setVotersData] = useState<VoterData[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingVoter, setEditingVoter] = useState<VoterData | null>(null);
    const [form] = Form.useForm();
    const [updating, setUpdating] = useState<boolean>(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [deleteConfirmVisible, setDeleteConfirmVisible] = useState<boolean>(false);
    const [recordToDelete, setRecordToDelete] = useState<Delegate | null>(null);

    // ============ HÀM LOAD DANH SÁCH ===============
    const fetchVoters = async () => {
        if (!electionId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response: BaseResponse<VoterData[]> = await VoterService.getByElectionId(electionId);
            if (response.success && response.data) {
                // Filter ra những record có status = INACTIVE (đã bị xóa)
                const activeVoters = structuredClone(response.data).filter(
                    (v) => v.status !== "INACTIVE"
                );
                
                const voters: VoterData[] = activeVoters.map((v, i) => ({
                    _id: String(v._id || `temp-${i}`),
                    userId: v.userId
                        ? {
                            _id: String(v.userId._id || ""),
                            fullName: String(v.userId.fullName || ""),
                            email: String(v.userId.email || ""),
                            username: String(v.userId.username || ""),
                            position: v.userId.position ? String(v.userId.position) : "",
                            department: v.userId.department ? String(v.userId.department) : "",
                        }
                        : (null as any),
                    status: v.status ? String(v.status) : "",
                }));

                setVotersData(structuredClone(voters));
                setData(
                    voters.map((v, i) => ({
                        id: String(v._id || `temp-${i}`),
                        name: v.userId?.fullName || "",
                        code: v.userId?.username || "",
                        email: v.userId?.email || "",
                        unit: v.userId?.department || "",
                        role: v.userId?.position || "",
                    }))
                );
            } else {
                message.error(response.message || "Không thể lấy danh sách cử tri");
                setData([]);
            }
        } catch (error: any) {
            console.error("Lỗi khi lấy danh sách cử tri:", error);
            message.error(error?.response?.data?.message || "Đã xảy ra lỗi khi tải dữ liệu");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchResults !== undefined && searchResults !== null) {
            // Nếu có kết quả tìm kiếm, hiển thị kết quả đó
            if (searchResults.length === 0) {
                setData([]);
                setVotersData([]);
                setLoading(false);
                return;
            }

            // Map kết quả tìm kiếm
            const voters: VoterData[] = searchResults.map((v: any, i: number) => ({
                _id: String(v._id || `temp-${i}`),
                userId: v.userId
                    ? {
                        _id: String(v.userId._id || ""),
                        fullName: String(v.userId.fullName || ""),
                        email: String(v.userId.email || ""),
                        username: String(v.userId.username || ""),
                        position: v.userId.position ? String(v.userId.position) : "",
                        department: v.userId.department ? String(v.userId.department) : "",
                    }
                    : (null as any),
                status: v.status ? String(v.status) : "",
            }));

            setVotersData(structuredClone(voters));
            setData(
                voters.map((v, i) => ({
                    id: String(v._id || `temp-${i}`),
                    name: v.userId?.fullName || "",
                    code: v.userId?.username || "",
                    email: v.userId?.email || "",
                    unit: v.userId?.department || "",
                    role: v.userId?.position || "",
                }))
            );
            setLoading(false);
        } else {
            // Nếu không có searchResults, load danh sách đầy đủ
            fetchVoters();
        }
    }, [electionId, searchResults]);

    // ============ MỞ MODAL SỬA ===============
    const handleEdit = (record: Delegate) => {
        const voter = votersData.find((v) => v._id === record.id);
        if (voter && voter.userId) {
            const voterCopy = structuredClone(voter); // clone sâu để tránh tham chiếu
            setEditingVoter(voterCopy);
            form.setFieldsValue({
                fullName: voter.userId.fullName || "",
                username: voter.userId.username || "",
                email: voter.userId.email || "",
                department: voter.userId.department || "",
                position: voter.userId.position || "",
            });
            setIsModalVisible(true);
        }
    };

    // ============ ĐÓNG MODAL ===============
    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingVoter(null);
        form.resetFields();
    };

    // ============ SUBMIT CẬP NHẬT ===============
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!editingVoter?.userId) return;

            setUpdating(true);
            const updateData = {
                fullName: values.fullName?.trim(),
                email: values.email?.trim(),
                position: values.position?.trim(),
                department: values.department?.trim(),
                username: values.username?.trim(),
            };

            const response: BaseResponse<any> = await (UserService as any).update(editingVoter.userId._id, updateData);
            if (response && (response.success || response.data)) {
                message.success("✅ Cập nhật thông tin cử tri thành công");
                setIsModalVisible(false);
                setEditingVoter(null);
                form.resetFields();
                await fetchVoters(); // reload lại list chuẩn nhất
            } else {
                message.error(response?.message || "Không thể cập nhật thông tin cử tri");
            }
        } catch (error: any) {
            console.error("Lỗi khi cập nhật cử tri:", error);
            message.error(error?.response?.data?.message || error?.message || "Đã xảy ra lỗi khi cập nhật");
        } finally {
            setUpdating(false);
        }
    };

    // ============ XÓA ĐẠI BIỂU ===============
    const handleDelete = (record: Delegate) => {
        console.log("handleDelete called with record:", record);

        if (!record || !record.id) {
            console.error("Invalid record:", record);
            message.error("Không tìm thấy thông tin đại biểu để xóa");
            return;
        }

        // Lưu record cần xóa và hiển thị modal
        setRecordToDelete(record);
        setDeleteConfirmVisible(true);
    };

    // Xác nhận xóa
    const handleConfirmDelete = async () => {
        if (!recordToDelete) return;

        try {
            // ✅ Tìm voter thật từ dữ liệu đã load
            const voter = votersData.find(v => v.userId?.email === recordToDelete.email);
            if (!voter?._id) {
                message.error("Không tìm thấy ID cử tri để xóa");
                return;
            }

            setDeleting(voter._id);
            console.log("🗑️ Deleting voter_id:", voter._id);

            const response: BaseResponse<any> = await VoterService.delete(voter._id);

            if (response.success) {
                message.success("✅ Xóa đại biểu thành công");
                setDeleteConfirmVisible(false);
                setRecordToDelete(null);
                
                // Xóa khỏi state ngay lập tức (optimistic update)
                setVotersData((prev) => prev.filter((v) => v._id !== voter._id));
                setData((prev) => prev.filter((d) => d.id !== voter._id));
                
                // Reload lại danh sách để đảm bảo đồng bộ
                await fetchVoters();
            } else {
                message.error(response?.message || "Không thể xóa đại biểu");
            }
        } catch (error: any) {
            console.error("Lỗi khi xóa:", error);
            message.error(error?.response?.data?.message || "Đã xảy ra lỗi khi xóa");
        } finally {
            setDeleting(null);
        }
    };


    // Hủy xóa
    const handleCancelDelete = () => {
        setDeleteConfirmVisible(false);
        setRecordToDelete(null);
    };

    // ============ CỘT TABLE ===============
    const columns = [
        { title: "Họ và Tên", dataIndex: "name", key: "name" },
        { title: "Mã định danh", dataIndex: "code", key: "code" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Đơn vị / Nhóm", dataIndex: "unit", key: "unit" },
        { title: "Vai trò", dataIndex: "role", key: "role" },
        {
            title: "Hành động",
            key: "action",
            render: (_: any, record: Delegate) => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Delete button clicked for record:", record);
                            console.log("Record ID:", record.id);
                            console.log("Record name:", record.name);

                            // Test: Kiểm tra xem onClick có được gọi không
                            if (!record || !record.id) {
                                console.error("Record is invalid:", record);
                                return;
                            }

                            // Gọi handleDelete
                            handleDelete(record);
                        }}
                        loading={deleting === record.id}
                        disabled={deleting === record.id}
                    />
                </Space>
            ),
        },
    ];

    // ============ GIAO DIỆN ===============
    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large" tip="Đang tải danh sách cử tri..." />
            </div>
        );
    }

    return (
        <>
            <Table
                rowKey={(record) => record.id} // ✅ Dùng id thật, KHÔNG nối với index
                columns={columns}
                dataSource={structuredClone(data)} // ✅ Clone nhẹ tránh shared reference
                pagination={false}
                bordered
                style={{ borderRadius: 12 }}
            />

            <Modal
                title={<div style={{ textAlign: "center", fontSize: 18, fontWeight: 600 }}>Thông tin cử tri</div>}
                open={isModalVisible}
                onCancel={handleCancel}
                onOk={handleSubmit}
                confirmLoading={updating}
                width={500}
                okText="Cập nhật"
                cancelText="Hủy"
                okButtonProps={{ style: { background: "#3ca860", borderColor: "#3ca860" } }}
            >
                {editingVoter?.userId && (
                    <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                        {/* Họ và tên - có dấu * đỏ */}
                        <Form.Item
                            label={<span>Họ và tên <span style={{ color: "red" }}></span></span>}
                            name="fullName"
                            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                        >
                            <Input placeholder="Nhập họ và tên" />
                        </Form.Item>

                        {/* Mã định danh - không bắt buộc */}
                        <Form.Item label="Mã định danh" name="username">
                            <Input placeholder="Nhập mã định danh" />
                        </Form.Item>

                        {/* Email - bị khóa, không cho sửa */}
                        <Form.Item label="Email" name="email">
                            <Input placeholder="Email cử tri" disabled style={{ backgroundColor: "#f5f5f5" }} />
                        </Form.Item>

                        {/* Đơn vị / Nhóm */}
                        <Form.Item label="Đơn vị / Nhóm" name="department">
                            <Input placeholder="Nhập đơn vị / nhóm" />
                        </Form.Item>

                        {/* Vai trò */}
                        <Form.Item label="Vai trò" name="position">
                            <Input placeholder="Nhập vai trò" />
                        </Form.Item>
                    </Form>
                )}
            </Modal>

            {/* Modal xác nhận xóa */}
            <Modal
                open={deleteConfirmVisible}
                onOk={handleConfirmDelete}
                onCancel={handleCancelDelete}
                okText="Xóa"
                cancelText="Hủy"
                centered
                width={440}
                closable={false}
                okButtonProps={{
                    danger: true,
                    loading: deleting === recordToDelete?.id,
                    style: {
                        backgroundColor: "linear-gradient(90deg, #ff4d4f 0%, #ff7a45 100%)",
                        borderColor: "#e53935",
                        fontWeight: 600,
                        borderRadius: 6,
                    },
                }}
                cancelButtonProps={{
                    style: { borderRadius: 6 },
                }}
            >
                {recordToDelete && (
                    <div style={{ textAlign: "center", padding: "8px 12px" }}>
                        {/* Icon cảnh báo */}
                        <div style={{ marginBottom: 8 }}>
                            <ExclamationCircleOutlined style={{ fontSize: 40, color: "#faad14" }} />
                        </div>

                        {/* Nội dung chính */}
                        <p style={{ fontSize: 17, color: "#444", marginBottom: 12 }}>
                            Bạn có chắc chắn muốn xóa đại biểu này ?
                        </p>

                        {/* Khung thông tin đại biểu */}
                        <div
                            style={{
                                display: "inline-block",
                                backgroundColor: "#f9f9f9",
                                borderRadius: 10,
                                padding: "10px 18px",
                                textAlign: "left",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                            }}
                        >
                            <p style={{ margin: 0, fontWeight: 600, color: "#111" }}>
                                Họ và tên: {recordToDelete.name}
                            </p>
                            {recordToDelete.email && (
                                <p style={{ margin: "4px 0 0", color: "#555" }}>
                                    Email: {recordToDelete.email}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default DelegateTable;
