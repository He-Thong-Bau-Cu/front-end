import { Modal, Typography, Divider, Row, Col, Tag, Button, Card } from "antd";
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

const typeMap: Record<string, { label: string; color: string }> = {
    VERIFICATION: { label: "Báo cáo xác thực", color: "green" },
    AUDIT: { label: "Báo cáo lưu trữ", color: "gold" },
    PENDING: { label: "Chờ xử lý", color: "blue" },
};

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
    open,
    onClose,
    data,
}) => {
    const { notify } = useNotification();
    if (!data) return null;

    const downloadUrlFileSign = async (record: any) => {
        try {
            const response = await FileService.getSignedFile(record.documentId.fileUrl);
            const blob = new Blob([response], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${record.summary || "Báo_cáo"}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err: any) {
            notify(err.response?.data?.message, "error");
        }
    };

    const election = data.electionId;
    const reportType = typeMap[data.type] || typeMap.PENDING;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={780}
            style={{ top: 40 }}
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <FileSearchOutlined style={{ fontSize: 24 }} />
                    <span style={{ fontSize: 20, fontWeight: 700 }}>Chi tiết báo cáo</span>
                </div>
            }
        >
            {/* ====== Summary Box ====== */}
            <Card
                style={{
                    background: "#eef9f0",
                    borderColor: "#b7eb8f",
                    marginBottom: 20,
                    borderRadius: 10,
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                        <Title level={4} style={{ marginBottom: 4 }}>
                            {data.summary || "Không có tên báo cáo"}
                        </Title>
                        <Text type="secondary">
                            {data.description || "Không có mô tả báo cáo"}
                        </Text>
                    </div>

                    <Tag color={reportType.color} style={{ height: 28, display: "flex", alignItems: "center" }}>
                        <CheckCircleOutlined /> &nbsp; {reportType.label}
                    </Tag>
                </div>
            </Card>

            {/* ====== Election Info ====== */}
            <Card
                title={
                    <span style={{ fontSize: 16 }}>
                        <ApartmentOutlined /> &nbsp; Thông tin cuộc bầu cử
                    </span>
                }
                bordered={true}
                style={{ marginBottom: 16, borderRadius: 10 }}
            >
                {election ? (
                    <Row gutter={[16, 10]}>
                        <Col span={12}><Text strong>Tên kỳ bầu cử:</Text><br /> {election.decisionName || "Không rõ"}</Col>
                        <Col span={12}><Text strong>Số quyết định:</Text><br /> {election.decisionNumber || "Không rõ"}</Col>
                        <Col span={12}><Text strong>Ngày bắt đầu:</Text><br /> {election.startDate ? (() => { const date = new Date(election.startDate); const h = String(date.getHours()).padStart(2, '0'); const m = String(date.getMinutes()).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${h}:${m} ${day}/${month}/${year}`; })() : "Không rõ"}</Col>
                        <Col span={12}><Text strong>Ngày kết thúc:</Text><br /> {election.endDate ? (() => { const date = new Date(election.endDate); const h = String(date.getHours()).padStart(2, '0'); const m = String(date.getMinutes()).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${h}:${m} ${day}/${month}/${year}`; })() : "Không rõ"}</Col>
                    </Row>
                ) : (
                    <Text type="secondary">Không có thông tin cuộc bầu cử</Text>
                )}
            </Card>

            {/* ====== Creator & Reviewer ====== */}
            <Row gutter={16}>
                <Col span={12}>
                    <Card
                        title={<span><UserOutlined /> &nbsp; Người tạo</span>}
                        bordered
                        style={{ borderRadius: 10, marginBottom: 16 }}
                    >
                        <Text strong>Họ tên:</Text><br />
                        {data.createdBy?.fullName || "Không rõ"}<br />
                        <Text strong>Ngày tạo:</Text><br />
                        {data.createdAt ? (() => { const date = new Date(data.createdAt); const h = String(date.getHours()).padStart(2, '0'); const m = String(date.getMinutes()).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${h}:${m} ${day}/${month}/${year}`; })() : "Không rõ"}
                    </Card>
                </Col>

                <Col span={12}>
                    <Card
                        title={<span><UserOutlined /> &nbsp; Người phê duyệt</span>}
                        bordered
                        style={{ borderRadius: 10, marginBottom: 16 }}
                    >
                        <Text strong>Họ tên:</Text><br />
                        {data.reviewedBy?.fullName || "Không rõ"}<br />
                        <Text strong>Ngày phê duyệt:</Text><br />
                        {data.reviewedAt ? (() => { const date = new Date(data.reviewedAt); const h = String(date.getHours()).padStart(2, '0'); const m = String(date.getMinutes()).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${h}:${m} ${day}/${month}/${year}`; })() : "Không rõ"}
                    </Card>
                </Col>
            </Row>

            {/* ====== File Attach ====== */}
            <Card
                title={<span><DownloadOutlined /> &nbsp; File báo cáo</span>}
                bordered
                style={{ borderRadius: 10, marginBottom: 20 }}
            >
                {data.documentId?.fileUrl ? (
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => downloadUrlFileSign(data)}
                    >
                        Tải báo cáo PDF
                    </Button>
                ) : (
                    <Text type="secondary">Không có file đính kèm</Text>
                )}
            </Card>

            <div style={{ textAlign: "right" }}>
                <Button onClick={onClose}>Đóng</Button>
            </div>
        </Modal>
    );
};

export default ReportDetailModal;
