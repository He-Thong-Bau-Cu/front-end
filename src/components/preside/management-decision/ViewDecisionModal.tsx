import React from "react";
import {
    Modal,
    Typography,
    Descriptions,
    Divider,
    Tag,
    Button,
    Spin,
} from "antd";
import {
    FileTextOutlined,
    CalendarOutlined,
    CloseCircleFilled,
} from "@ant-design/icons";
import "../../../style/preside/ViewDecision.model.css";
import { Decision } from "@/types/Decision.interface";

const { Title, Text } = Typography;
interface ViewDecisionModalProps {
    open: boolean;
    onClose: () => void;
    data?: Decision;
    loading?: boolean;
}
const ViewDecisionModal: React.FC<ViewDecisionModalProps> = ({
    open,
    onClose,
    data,
    loading = false,
}) => {

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

    // Map status từ English sang tiếng Việt
    const statusMap: { [key: string]: string } = {
        "APPROVED_SIGNED": "Đã phê duyệt",
        "WAIT_APPROVAL": "Chờ duyệt",
        "REQUEST_EDIT": "Yêu cầu chỉnh sửa",
        "WAIT_ENTER_DATA": "Chờ nhập dữ liệu",
        "DELETED": "Đã đóng",
    };
   

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            centered
            className="view-decision-modal"
            closeIcon={null} // ❌ Ẩn hoàn toàn dấu X mặc định
        >
            <Spin spinning={loading}>
                {!data && !loading ? (
                    <div style={{ padding: "40px", textAlign: "center" }}>
                        <Text>Không có dữ liệu</Text>
                    </div>
                ) : data ? (
                    <>
                        {/* Header */}
                        <div className="decision-view-header">
                            <FileTextOutlined className="header-icon" />
                            <div className="header-text">
                                <Title level={4} className="header-title">
                                    {data.decisionName}
                                </Title>
                                <Text className="header-sub">
                                    Số quyết định: {data.decisionNumber}
                                </Text>
                            </div>

                            {/* ✅ Nút đóng tinh tế trong header */}
                            <Button
                                type="text"
                                icon={<CloseCircleFilled style={{ color: "#fff", fontSize: 20 }} />}
                                onClick={onClose}
                                className="btn-close-header"
                            />
                        </div>

                        <Divider style={{ margin: "12px 0" }} />
                        {/* Thông tin tổng quan */}
                        <Descriptions bordered size="small" column={2}>
                            <Descriptions.Item label="Ngày ban hành">
                                <CalendarOutlined /> {formatDate(data.startDate)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày kết thúc">
                                <CalendarOutlined /> {formatDate(data.endDate)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày bắt đầu ủy quyền">
                                <CalendarOutlined /> {formatDate(data.delegationStart)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày kết thúc ủy quyền">
                                <CalendarOutlined /> {formatDate(data.delegationEnd)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tác giả">
                                {data.createdByUserId?.fullName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại bầu cử">
                                {data.typeId?.typeName || "Không có"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phương pháp bầu cử">
                                {data.votingMethodId?.methodName || "Không có"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngưỡng phê duyệt">
                                {data.thresholdId?.thresholdName || "Không có"}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">
                                <Tag color={data.statusData === "APPROVED_SIGNED" ? "green" : data.statusData === "WAIT_ENTER_DATA" ? "orange" :
                                    data.statusData === "WAIT_APPROVAL" ? "yellow" :data.statusData === "REQUEST_EDIT" ? "pink" : data.statusData === "DELETED" ? "red" : "gray"}>
                                    {statusMap[data.statusData ] || data.statusData }
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        <div style={{ textAlign: "right", marginTop: 16 }}>
                            <Button onClick={onClose}>Đóng</Button>
                        </div>
                    </>
                ) : null}
            </Spin>
        </Modal>
    );
};

export default ViewDecisionModal;
