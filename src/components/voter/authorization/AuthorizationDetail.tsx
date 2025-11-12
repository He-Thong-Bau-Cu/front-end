import { Card, Typography, Tag, Descriptions, Space, Avatar, Divider, Row, Col, Spin, message } from "antd";
import { CheckOutlined, ClockCircleOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import styles from "./../../../style/voter/AuthorizationHistory.module.css";
import { DelegationDetail } from "@/types/Delegate.interface";
import DelegationService from "@/services/DelegationService";
import { useLocation } from "react-router-dom";


const { Text, Title } = Typography;



// Format date to Vietnamese format
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

// Format status to Vietnamese
const getStatusLabel = (status: string) => {
    switch (status) {
        case "PENDING":
            return "Đang chờ duyệt";
        case "APPROVED":
            return "Đã duyệt";
        case "REJECTED":
            return "Đã từ chối";
        default:
            return status;
    }
};

// Format status color
const getStatusColor = (status: string) => {
    switch (status) {
        case "PENDING":
            return "orange";
        case "APPROVED":
            return "green";
        case "REJECTED":
            return "red";
        default:
            return "default";
    }
};

// Format delegation type to Vietnamese
const getDelegationTypeLabel = (type: string) => {
    switch (type) {
        case "long_term":
            return "Ủy quyền dài hạn";
        case "short_term":
            return "Ủy quyền ngắn hạn";
        default:
            return type;
    }
};

const AuthorizationDetail = () => {
    const [delegationData, setDelegationData] = useState<DelegationDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const location = useLocation();
    const electionId = location.state?.electionId || localStorage.getItem("currentElectionId");


    useEffect(() => {
        const fetchDelegation = async () => {
            try {
                setLoading(true);

                const delegatorId = localStorage.getItem("userId");

                if (!delegatorId) {
                    message.error("Không tìm thấy thông tin người dùng");
                    return;
                }

                if (!electionId) {
                    message.error("Không tìm thấy electionId");
                    return;
                }

                const data = await DelegationService.getDelegation(delegatorId, electionId);
                setDelegationData(data);
            } catch (error) {
                message.error("Không thể tải thông tin ủy quyền");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDelegation();
    }, [electionId]);

    if (loading) {
        return (
            <Card className={styles.delegationHistoryCard}>
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Spin size="large" />
                </div>
            </Card>
        );
    }

    if (!delegationData) {
        return (
            <Card className={styles.delegationHistoryCard}>
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Text type="secondary">Không có thông tin ủy quyền</Text>
                </div>
            </Card>
        );
    }

    const { delegatorId, delegateId, status, startDate, endDate, delegationType, confirmedAt, confirmedBy, createdAt } = delegationData;

    return (
        <Card
            title={
                <div className={styles.titleContainer}>
                    <Title level={5} className={styles.cardTitle}>
                        📜 Chi tiết ủy quyền
                    </Title>
                    <Tag
                        color={getStatusColor(status)}
                        icon={status === "PENDING" ? <ClockCircleOutlined /> : <CheckOutlined />}
                        className={`${styles.statusTag} ${styles[`status${status}`]}`}
                    >
                        {getStatusLabel(status)}
                    </Tag>
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
                                    <br />
                                    <Text type="secondary" className={styles.userUsername}>
                                        @{delegatorId.username}
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
                                        {delegateId.fullName.charAt(0)}
                                    </Avatar>
                                </div>
                                <div className={styles.userDetails}>
                                    <Text strong className={styles.userName}>
                                        {delegateId.fullName}
                                    </Text>
                                    <br />
                                    <Text type="secondary" className={styles.userEmail}>
                                        {delegateId.email}
                                    </Text>
                                    <br />
                                    <Text type="secondary" className={styles.userUsername}>
                                        @{delegateId.username}
                                    </Text>
                                </div>
                            </Space>
                            <Divider className={styles.divider} />
                            <Descriptions column={1} size="small" className={styles.descriptions}>
                                <Descriptions.Item label="Chức vụ">
                                    {delegateId.position}
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
                        <Descriptions.Item label="Loại ủy quyền">
                            <span className={styles.delegationType}>
                                {getDelegationTypeLabel(delegationType)}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày bắt đầu">
                            {formatDate(startDate)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày kết thúc">
                            {formatDate(endDate)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {formatDate(createdAt)}
                        </Descriptions.Item>
                        {confirmedAt && (
                            <Descriptions.Item label="Ngày xác nhận">
                                {formatDate(confirmedAt)}
                            </Descriptions.Item>
                        )}
                        {confirmedBy && (
                            <Descriptions.Item label="Người xác nhận">
                                {confirmedBy.fullName} ({confirmedBy.email})
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Card>
            </Space>
        </Card>
    );
};

export default AuthorizationDetail;
