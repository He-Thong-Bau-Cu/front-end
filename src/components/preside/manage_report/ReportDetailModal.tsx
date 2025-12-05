import { Modal, Typography, Divider, Row, Col, Tag, Button, Card, message } from "antd";
import {
    FileSearchOutlined,
    DownloadOutlined,
    UserOutlined,
    CheckCircleOutlined,
    ApartmentOutlined,
} from "@ant-design/icons";
import FileService from "@/services/FileService";
import { useNotification } from "@/contexts/NotificationContext";

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
    const { notify } = useNotification();
    if (!data) return null;
    const downloadUrlFileSign = async (data: any) => {
        try {
            const response = await FileService.getSignedFile(data.documentId.fileUrl);
            const blob = new Blob([response], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${data.summary || "Báo_cáo"}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err: any) {
            notify(err.message, "error");
        }
    };
    const election = data.electionId; // thông tin cuộc bầu cử

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={760}
            style={{ top: 40 }}
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
                    {data.summary || "Không có tên báo cáo"}
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

            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                    <Text strong>Người phê duyệt:</Text>
                    <div>
                        <UserOutlined /> {data.reviewedBy?.fullName || "Không rõ"}
                    </div>
                </Col>

                <Col span={12}>
                    <Text strong>Ngày phê duyệt:</Text>
                    <div>
                        {data.reviewedAt
                            ? new Date(data.reviewedAt).toLocaleString("vi-VN")
                            : "Không rõ"}
                    </div>
                </Col>
            </Row>

            {/* ====== NGƯỜI KÝ ====== */}
            <Row gutter={16} style={{ marginBottom: 16 }}>

                <Col span={12}>
                    <Text strong>Loại báo cáo:</Text>
                    <div>
                        {data.type === "VERIFICATION" ? (
                            <Tag icon={<CheckCircleOutlined />} color="red">
                                Báo cáo xác thực
                            </Tag>
                        ) : data.type === "AUDIT" ? (
                            <Tag icon={<CheckCircleOutlined />} color="orange">
                                Báo cáo lưu trữ
                            </Tag>
                        ) : (
                            <Tag icon={<CheckCircleOutlined />} color="green">
                                Báo cáo khác
                            </Tag>
                        )}
                    </div>
                </Col>

                {data.documentId && (
                    <Col span={12}>
                        <Text strong>File báo cáo:</Text>
                        <div>
                            {data.documentId?.fileUrl ? (
                                <Button
                                    type="primary"
                                    icon={<DownloadOutlined />}
                                    onClick={() => downloadUrlFileSign(data)}
                                >
                                    Xuất báo cáo
                                </Button>
                            ) : (
                                <Text type="secondary">Không có file</Text>
                            )}
                        </div>
                    </Col>
                )}
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
