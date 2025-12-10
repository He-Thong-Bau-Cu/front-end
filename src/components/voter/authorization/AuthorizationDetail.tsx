import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import DelegationService from "@/services/DelegationService";
import FileService from "@/services/FileService";
import { DelegationDetail } from "@/types/Delegate.interface";
import { CheckOutlined, ClockCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, LeftOutlined, StopOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Col, Descriptions, Divider, Row, Space, Tag, Typography } from "antd";
import moment from "moment-timezone";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./../../../style/voter/AuthorizationHistory.module.css";


const { Text, Title } = Typography;


const getStatusLabel = (status: string) => {
    switch (status) {
        case "PENDING":
            return "Đang chờ phê duyệt";
        case "CONFIRMED":
            return "Đã phê duyệt";
        case "ACTIVE":
            return "Đang có hiệu lực";
        case "EXPIRED":
            return "Hết hiệu lực";
        case "REVOKED":
            return "Đã thu hồi";
        case "INVALID":
            return "Không hợp lệ";
        case "REJECTED":
            return "Đã từ chối";
        case "SIGNED":
            return "Đã ký";
        default:
            return status;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "PENDING":
            return "orange";
        case "CONFIRMED":
            return "green";
        case "ACTIVE":
            return "blue";
        case "EXPIRED":
            return "default";
        case "REVOKED":
            return "red";
        case "INVALID":
            return "magenta";
        case "REJECTED":
            return "red";
        case "SIGNED":
            return "cyan";
        default:
            return "default";
    }
};



const AuthorizationDetail = () => {
    const [delegationData, setDelegationData] = useState<DelegationDetail | null>(null);
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();
    const location = useLocation();
    const delegationId = location.state?.id;
    const navigate = useNavigate();

    const [fileUrl, setFileUrl] = useState<string>("");

    useEffect(() => {
        const loadFile = async () => {
            if (!delegationData?.documentId?.fileUrl) return;

            try {
                const key = delegationData.documentId.fileUrl;

                const fileBlob = await FileService.getSignedFile(key);

                const url = URL.createObjectURL(fileBlob);

                setFileUrl(url);
            } catch (err) {
                console.error("Lỗi load file:", err);
            }
        };

        loadFile();
    }, [delegationData]);




    useEffect(() => {
        const fetchDelegation = async () => {
            try {
                showLoading();
                if (!delegationId) {
                    notify("Không tìm thấy ID ủy quyền");
                    return;
                }

                const data = await DelegationService.getDelegationById(delegationId);

                setDelegationData(data);
            } catch {
                notify("Không thể tải thông tin ủy quyền");
            } finally {
                hideLoading();
            }
        };

        fetchDelegation();
    }, [delegationId]);


    if (!delegationData) {
        return (
            <Card className={styles.delegationHistoryCard}>
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Text type="secondary">Không có thông tin ủy quyền</Text>
                </div>
            </Card>
        );
    }

    const { delegatorId, delegateId, delegateInfo, status, startDate, endDate, createdAt, delegateReason } = delegationData;

    const delegate = delegateId ?? delegateInfo;

    return (
        <>
            <Card
                title={
                    <div className={styles.titleContainer}>
                        <Title level={5} className={styles.cardTitle} style={{ margin: 0 }}>
                            📜 Chi tiết ủy quyền
                        </Title>
                        <Button
                            className={styles.backButton}
                            icon={<LeftOutlined />}
                            onClick={() => navigate(-1)}
                        >
                            Quay lại
                        </Button>

                    </div>
                }
                className={styles.delegationHistoryCard}
            >
                <Space direction="vertical" style={{ width: "100%" }} size="large">
                    {/* Thông tin người ủy quyền và người được ủy quyền */}
                    <Row gutter={[16, 16]} className={styles.usersRow}>
                        <Col xs={24} md={12}>
                            <Card
                                size="small"
                                title={<Title level={5} className={styles.cardSectionTitle}>Người ủy quyền</Title>}
                                className={styles.userCard}
                            >
                                <Space className={styles.userInfo}>
                                    <div className={styles.avatarWrapper}>
                                        <Avatar
                                            size={64}
                                            className={styles.delegatorAvatar}
                                            icon={<UserOutlined />}
                                        >
                                            {delegatorId.fullName.charAt(0)}
                                        </Avatar>
                                    </div>
                                    <div className={styles.userDetails}>
                                        <Text strong className={styles.userName}>
                                            {delegatorId.fullName}
                                        </Text>
                                        <br />
                                        <Text type="secondary" className={styles.userEmail}>
                                            {delegatorId.email}
                                        </Text>

                                    </div>
                                </Space>
                                <Divider className={styles.divider} />
                                <Descriptions column={1} size="small" className={styles.descriptions}>
                                    <Descriptions.Item label="Chức vụ">
                                        {delegatorId.position}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col xs={24} md={12}>
                            <Card
                                size="small"
                                title={<Title level={5} className={styles.cardSectionTitle}>Người được ủy quyền</Title>}
                                className={styles.userCard}
                            >
                                <Space className={styles.userInfo}>
                                    <div className={styles.avatarWrapper}>
                                        <Avatar
                                            size={64}
                                            className={styles.delegateAvatar}
                                            icon={<UserOutlined />}
                                        >
                                            {delegate?.fullName?.charAt(0) ?? "?"}
                                        </Avatar>
                                    </div>

                                    <div className={styles.userDetails}>
                                        <Text strong className={styles.userName}>
                                            {delegate?.fullName ?? "Không có dữ liệu"}
                                        </Text>
                                        <br />
                                        <Text type="secondary" className={styles.userEmail}>
                                            {delegate?.email ?? "---"}
                                        </Text>


                                    </div>
                                </Space>

                                <Divider className={styles.divider} />

                                <Descriptions column={1} size="small" className={styles.descriptions}>
                                    <Descriptions.Item label="Chức vụ">
                                        {delegateId?.position ?? "-"}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                    </Row>

                    {/* Thông tin ủy quyền */}
                    <Card
                        size="small"
                        title={<Title level={5} className={styles.cardSectionTitle}>Thông tin ủy quyền</Title>}
                        className={styles.infoCard}
                    >
                        <Descriptions column={1} bordered size="small" className={styles.delegationInfo}>
                            <Descriptions.Item label="Trạng thái">
                                <Tag
                                    color={getStatusColor(status)}
                                    icon={
                                        status === "PENDING" ? <ClockCircleOutlined /> :
                                            status === "CONFIRMED" ? <CheckOutlined /> :
                                                status === "ACTIVE" ? <CheckOutlined /> :
                                                    status === "EXPIRED" ? <ExclamationCircleOutlined /> :
                                                        status === "REVOKED" ? <CloseCircleOutlined /> :
                                                            status === "INVALID" ? <StopOutlined /> :
                                                                status === "REJECTED" ? <CloseCircleOutlined /> :
                                                                    status === "SIGNED" ? <CheckOutlined /> :
                                                                        null
                                    }
                                    className={`${styles.statusTag} ${styles.statusTagCompact} ${styles[`status${status}`]}`}
                                >
                                    {getStatusLabel(status)}
                                </Tag>
                            </Descriptions.Item>

                            <Descriptions.Item label="Ngày bắt đầu">
                                {moment.utc(startDate).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày kết thúc">
                                {moment.utc(endDate).format("DD/MM/YYYY")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tạo">
                                {moment.utc(createdAt).format("DD/MM/YYYY HH:mm:ss")}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lí do ủy quyền">
                                {delegateReason || "-"}
                            </Descriptions.Item>
                            {fileUrl && (
                                <Descriptions.Item label="File đã ký">
                                    <Button
                                        size="small"
                                        className={styles.downloadFileButton}
                                        onClick={() => {
                                            const a = document.createElement("a");
                                            a.href = fileUrl;
                                            a.download = "file_uy_quyen_da_ky.pdf";
                                            a.click();
                                        }}
                                    >
                                        Tải xuống file
                                    </Button>
                                </Descriptions.Item>
                            )}
                            {/* {confirmedAt && (
                            <Descriptions.Item label="Ngày xác nhận">
                                {formatDateWithTime(confirmedAt)}
                            </Descriptions.Item>
                        )}
                        {confirmedBy && (
                            <Descriptions.Item label="Người xác nhận">
                                {confirmedBy.fullName} ({confirmedBy.email})
                            </Descriptions.Item>
                        )} */}


                        </Descriptions>
                    </Card>


                </Space>
            </Card>
        </>
    );
};

export default AuthorizationDetail;
