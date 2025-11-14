import { Modal, Typography, Divider, Row, Col, Tag, Button, Card } from "antd";
import {
    FileSearchOutlined,
    DownloadOutlined,
    UserOutlined,
    CheckCircleOutlined,
    ApartmentOutlined,
    FileDoneOutlined
} from "@ant-design/icons";
import FileService from "@/services/FileService";

const { Title, Text } = Typography;

interface ReportDetailModalProps {
    open: boolean;
    onClose: () => void;
    data: any | null;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
    open,
    onClose,
    data,
}) => {
    if (!data) return null;

    const election = data.electionId; // thông tin cuộc bầu cử

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={760}
            style={{ top: 40 }}
            bodyStyle={{ padding: "24px 32px" }}
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <FileSearchOutlined style={{ fontSize: 22 }} />
                    <span style={{ fontSize: 20, fontWeight: 700 }}>Chi tiết báo cáo</span>
                </div>
            }
        >
            {/* ====== TÊN + MÔ TẢ ====== */}
            <Card
                style={{
                    background: "#f6ffed",
                    borderColor: "#b7eb8f",
                    marginBottom: 20,
                    borderRadius: 10,
                }}
            >
                <Title level={4} style={{ marginBottom: 4 }}>
                    {data.title || "Không có tên báo cáo"}
                </Title>

                <Text type="secondary">
                    {data.description || "Không có mô tả báo cáo"}
                </Text>
            </Card>

            {/* ====== THÔNG TIN CUỘC BẦU CỬ ====== */}
            <Title level={5} style={{ marginBottom: 12 }}>
                <ApartmentOutlined /> Thông tin cuộc bầu cử
            </Title>

            <Card style={{ marginBottom: 16, borderRadius: 10 }}>
                {election ? (
                    <>
                        <p>
                            <b>Tên kỳ bầu cử:</b> {election.decisionName || "Không rõ"}
                        </p>
                        <p>
                            <b>Số quyết định:</b> {election.decisionNumber || "Không rõ"}
                        </p>
                        <p>
                            <b>Ngày bắt đầu:</b>{" "}
                            {election.startDate
                                ? new Date(election.startDate).toLocaleDateString("vi-VN")
                                : "Không rõ"}
                        </p>
                        <p>
                            <b>Ngày kết thúc:</b>{" "}
                            {election.endDate
                                ? new Date(election.endDate).toLocaleDateString("vi-VN")
                                : "Không rõ"}
                        </p>

                    </>
                ) : (
                    <Text type="secondary">Không có thông tin cuộc bầu cử</Text>
                )}
            </Card>

            {/* ====== THÔNG TIN NGƯỜI TẠO / NGÀY TẠO ====== */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                    <Text strong>Người tạo:</Text>
                    <div>
                        <UserOutlined /> {data.createdBy?.fullName || "Không rõ"}
                    </div>
                </Col>

                <Col span={12}>
                    <Text strong>Ngày tạo:</Text>
                    <div>
                        {data.createdAt
                            ? new Date(data.createdAt).toLocaleString("vi-VN")
                            : "Không rõ"}
                    </div>
                </Col>
            </Row>

            {/* ====== NGƯỜI KÝ ====== */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                    <Text strong>Người ký:</Text>
                    <div>
                        <CheckCircleOutlined />{" "}
                        {data.signedBy?.fullName || "Chưa được ký"}
                    </div>
                </Col>

                <Col span={12}>
                    <Text strong>File báo cáo:</Text>
                    <div>
                        {data.fileUrl ? (
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={async () => {
                                    try {
                                        if (!data.fileUrl) return;

                                        // 1. Tách fileName từ URL (ví dụ: reports/abc.pdf → abc.pdf)
                                        const fileName = data.fileUrl;

                                        // 2. Lấy presigned URL từ API
                                        const presignedUrl = await FileService.getPresignedUrl(
                                            "report",               // fileType do backend yêu cầu
                                            data.createdBy?._id,    // userId
                                            fileName,               // fileName
                                            300                      // expiresIn (seconds)
                                        );
                                        // 3. Mở link để tải
                                        window.open(presignedUrl, "_blank");
                                    } catch (err) {
                                        console.error("Không thể xuất báo cáo:", err);
                                    }
                                }}
                            >
                                Xuất báo cáo
                            </Button>
                        ) : (
                            <Text type="secondary">Không có file</Text>
                        )}
                    </div>
                </Col>
            </Row>

            <Divider />



            <Divider />

            <div style={{ textAlign: "right" }}>
                <Button onClick={onClose}>Đóng</Button>
            </div>
        </Modal>
    );
};

export default ReportDetailModal;
