import React, { useEffect, useState } from "react";
import {
    Modal,
    Card,
    Typography,
    Row,
    Col,
    Divider,
    Table,
    Button,
    Spin,
    message,
} from "antd";
import {
    DownloadOutlined,
    FileDoneOutlined,
} from "@ant-design/icons";

import DelegationService from "@/services/DelegationService";
import "../../../style/preside/AuthorizationDetailModal.model.css";
import { SummaryDelegate } from "@/types/SummaryDelegate.interface";
import { DelegationSummary } from "@/types/Delegate.interface";
import DigitalSignModal from "@/pages/digitalSignature/DigitalSignModal";
const { Title, Text } = Typography;
import { useLoading } from "@/contexts/LoadingContext";
const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return "";
    }
};
interface AuthorizationDetailModalProps {
    open: boolean;
    onClose: () => void;
    recordId: string | null;   // ONLY RECEIVES ID
}

const AuthorizationDetailModal: React.FC<AuthorizationDetailModalProps> = ({
    open,
    onClose,
    recordId,
}) => {

    const [data, setData] = useState<SummaryDelegate | null>(null);
    const [electionId, setElectionId] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [urlFile, setUrlFile] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const { showLoading, hideLoading } = useLoading();
    const loadDetail = async () => {
        if (!recordId) return;
        setLoading(true);
        try {
            const res = await DelegationService.getAllSummaryDelegation({
                secretaryId: "651f0a7c1f2b4d1a12345678",
                electionId: recordId,
                recipient: "Chủ tịch"
            });
            setData(res?.data[0] || res);
            setElectionId(data?.election?._id);
        } catch (err) {
            console.error("Lỗi tải chi tiết ủy quyền:", err);
            message.error("Không thể tải chi tiết tài liệu!");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDecision = async (id: string) => {
        try {
            showLoading();
            setModalOpen(true);
        } catch (error: any) {
            console.error("Error loading decision details:", error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Không thể tải chi tiết quyết định. Vui lòng thử lại.";
            message.error(errorMessage);
            setModalOpen(false);
        } finally {
            hideLoading();
        }
    };

    useEffect(() => {
        if (open) loadDetail();
    }, [open, recordId]);

    // ========================
    //  DOWNLOAD FILE
    // ========================
    const downloadUrlFile = async () => {
        try {
            const response = await DelegationService.getSummaryDelegationPdf({
                secretaryId: "651f0a7c1f2b4d1a12345678",
                electionId: data?.election?._id,
                recipient: "Chủ tịch"
            });

            const blob = new Blob([response], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "Danh_sach_uy_quyen.pdf";
            a.click();

            URL.revokeObjectURL(url); // cleanup
        } catch (err) {
            console.error(err);
            message.error("Không thể tải file!");
        }
    };


    // ========================
    //  TABLE MAPPING
    // ========================
    const columns = [
        { title: "STT", dataIndex: "index" },
        { title: "Người ủy quyền", dataIndex: "delegator" },
        { title: "Người được ủy quyền", dataIndex: "delegate" },
        { title: "Ngày tạo", dataIndex: "createdAt" },
    ];

    const mappedList = data?.delegations?.map((item: DelegationSummary, idx: number) => ({
        index: idx + 1 || idx,
        delegator: item.delegator.fullName,
        delegate: item.delegate.fullName,
        createdAt: formatDate(item.createdAt),
    })) || [];

    return (
        <>
            <Modal
                open={open}
                onCancel={onClose}
                footer={null}
                width={850}
                centered
                className="delegation-modal"
            >
                <Spin spinning={loading} tip="Đang tải dữ liệu...">
                    <Card className="a4-paper"   >

                        {/* HEADER */}
                        <Row justify="space-between" className="report-header">
                            <Col span={10} className="text-center">
                                <Text strong>{"CÔNG TY ABC"}</Text><br />
                                <Text>Số: {data?.election?.decisionNumber || "—"}</Text>
                            </Col>

                            <Col span={10} className="text-center">
                                <Text strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text><br />
                                <Text italic>Độc lập - Tự do - Hạnh phúc</Text>
                            </Col>
                        </Row>

                        {/* TITLE */}
                        <div className="report-title">
                            <Title level={3} style={{ margin: 0 }}>
                                BÁO CÁO
                            </Title>
                            <Title level={4} style={{ marginTop: 4, fontWeight: 700 }}>
                                TỔNG HỢP ỦY QUYỀN ĐÃ TIẾP NHẬN
                            </Title>
                        </div>

                        {/* INFO */}
                        <div className="report-info">
                            <p><strong>Kính gửi:</strong> Chủ tọa</p>
                            <p><strong>Người gửi:</strong> Thư ký 123</p>
                            <p><strong>Ngày lập báo cáo:</strong> {formatDate(data?.delegations[0]?.endDate)}</p>
                        </div>
                        <Divider />
                        {/* ELECTION TITLE */}
                        <Text strong>
                            Cuộc bầu cử: {data?.election?.title}
                        </Text>

                        {/* TABLE */}
                        <Table
                            rowKey={(record) => record.index}
                            columns={columns}
                            dataSource={mappedList}
                            pagination={false}
                            bordered
                            className="report-table"
                            style={{ marginTop: 12 }}
                        />

                        {/* FOOTER */}
                        <Row style={{ marginTop: 60 }}>
                            <Col span={24} style={{ textAlign: "right", paddingRight: 40, paddingBottom: 100 }}>
                                <Text strong>CHỦ TỌA</Text>
                            </Col>
                        </Row>

                        {/* NÚT HÀNH ĐỘNG */}
                        {/* NÚT HÀNH ĐỘNG */}
                        {data?.status === "PENDING" ?
                            (<Row style={{ marginTop: 20, marginBottom: 20 }}>
                                <Col span={24} style={{ textAlign: "right", paddingRight: 40 }}>

                                    {/* Nút tải file URL */}
                                    <Button
                                        icon={<DownloadOutlined />}
                                        style={{ marginRight: 12 }}
                                        onClick={downloadUrlFile}
                                    >
                                        Tải file
                                    </Button>

                                    {/* Nút từ chối */}
                                    <Button
                                        danger
                                        style={{ marginRight: 12 }}
                                    >
                                        Từ chối
                                    </Button>

                                    {/* Nút phê duyệt */}
                                    <Button
                                        onClick={() => handleViewDecision(data.election._id)}
                                        type="primary"
                                        style={{ background: "#52c41a", borderColor: "#52c41a" }}
                                    >
                                        Phê duyệt
                                    </Button>

                                </Col>

                            </Row>) : ("")}



                    </Card>
                </Spin>
            </Modal>
            <DigitalSignModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                electionId={data?.election._id}
                delegate={true}
                onSuccess={() => {
                    message.success("Ký số thành công!");
                    setModalOpen(false);
                    onClose(); // đóng modal A4
                }}
            />

        </>
    );
};

export default AuthorizationDetailModal;
