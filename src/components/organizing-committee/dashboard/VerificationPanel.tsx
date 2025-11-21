import { Card, Input, Button, Modal, Descriptions, Spin, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useState } from "react";
import DelegateCardService from "@/services/DelegateCardService";
import MeetingService from "@/services/MeetingService";
import MeetingAttendeeService from "@/services/MeetingAttendeeService";
import ElectionParticipantService from "@/services/ElectionParticipantsService";
import { BaseResponse } from "@/types/BaseResponse.interface";

const VerificationPanel: React.FC = () => {
    const [searchText, setSearchText] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [delegateData, setDelegateData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [participantId, setParticipantId] = useState<string | null>(null);

    const handleOpenModal = async () => {
        if (!searchText.trim()) {
            message.warning("Vui lòng nhập ID thẻ đại biểu");
            return;
        }

        const cardId = searchText.trim();
        setLoading(true);
        setIsModalVisible(true);
        setDelegateData(null);
        setParticipantId(null);

        try {
            // Gọi API getById để lấy thông tin thẻ đại biểu
            console.log("📡 Đang gọi API getById với ID:", cardId);
            const response: BaseResponse<any> = await DelegateCardService.getById(cardId);
            console.log("📥 Response từ API:", response);
            
            if (!response || !response.success || !response.data) {
                console.error("❌ Response không hợp lệ:", response);
                message.error("Không tìm thấy thẻ đại biểu với ID này");
                setLoading(false);
                return;
            }

            const delegateCard = response.data;
            console.log("📋 DelegateCard data:", delegateCard);
            
            // Lấy thông tin voter từ delegateCard
            const voter = delegateCard.voterId;
            if (!voter || !voter.userId) {
                console.error("❌ Không tìm thấy voter hoặc userId:", { voter });
                message.error("Không tìm thấy thông tin cử tri");
                setLoading(false);
                return;
            }

            // Map dữ liệu để hiển thị trong modal (giống QRScannerPanel)
            const userId = voter.userId;
            const electionId = delegateCard.electionId?._id || delegateCard.electionId;
            
            const delegateInfo = {
                id: delegateCard._id,
                fullName: userId.fullName || "",
                code: userId.username || "",
                department: userId.department || "",
                position: userId.position || "",
                email: userId.email || "",
                phone: userId.phone || voter.phone || "",
                electionName: delegateCard.electionId?.title || "",
                userId: userId._id || userId,
                electionId: electionId,
            };

            console.log("👤 DelegateInfo mapped:", delegateInfo);

            // Hiển thị thông tin đại biểu ngay lập tức
            setDelegateData(delegateInfo);

            // Tìm ElectionParticipant (không bắt buộc để hiển thị, chỉ cần để check-in)
            if (electionId && userId._id) {
                try {
                    const participantResponse: BaseResponse<any> = await ElectionParticipantService.getByUserId(userId._id);
                    const participantList = participantResponse?.data
                        ? (Array.isArray(participantResponse.data) ? participantResponse.data : [participantResponse.data])
                        : [];
                    const participant = participantList.find(
                        (p: any) => p.electionId?._id === electionId || p.electionId === electionId
                    );

                    if (participant && participant._id) {
                        setParticipantId(participant._id);
                        message.success("✅ Đã tìm thấy đại biểu");
                    } else {
                        message.warning("⚠️ Người này chưa được thêm vào danh sách tham gia cuộc bầu cử. Vẫn có thể xem thông tin nhưng không thể check-in.");
                    }
                } catch (participantError: any) {
                    console.warn("⚠️ Lỗi khi tìm ElectionParticipant:", participantError);
                    message.warning("⚠️ Không thể kiểm tra trạng thái tham gia cuộc bầu cử. Vẫn có thể xem thông tin.");
                }
            } else {
                console.warn("⚠️ Thiếu electionId hoặc userId._id:", { electionId, userId: userId._id });
                message.warning("⚠️ Thiếu thông tin cuộc bầu cử hoặc người dùng. Vẫn có thể xem thông tin.");
            }
        } catch (error: any) {
            console.error("❌ Lỗi khi lấy thông tin thẻ đại biểu:", error);
            console.error("❌ Error details:", {
                message: error?.message,
                response: error?.response,
                responseData: error?.response?.data,
                status: error?.response?.status,
            });
            const errorMsg = error?.response?.data?.message || error?.message || "Không thể lấy thông tin thẻ đại biểu";
            message.error(`❌ ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!delegateData) {
                message.error("Không có thông tin đại biểu");
                return;
            }

            // Lấy cuộc bầu cử từ localStorage (đã chọn ở trang home)
            const currentElectionId = localStorage.getItem("currentElectionId");
            if (!currentElectionId) {
                message.warning("Vui lòng chọn cuộc bầu cử từ trang chủ");
                return;
            }

            // Lấy cuộc họp theo electionId (1 cuộc bầu cử chỉ có 1 cuộc họp)
            const meetingsResponse: BaseResponse<any> = await MeetingService.getByElectionId(currentElectionId);
            if (!meetingsResponse || !meetingsResponse.success || !meetingsResponse.data) {
                message.error("Không tìm thấy cuộc họp cho cuộc bầu cử này");
                return;
            }

            const meetings = Array.isArray(meetingsResponse.data) ? meetingsResponse.data : [meetingsResponse.data];
            if (meetings.length === 0) {
                message.error("Chưa có cuộc họp nào được tạo cho cuộc bầu cử này");
                return;
            }

            // Lấy meeting đầu tiên (vì 1 cuộc bầu cử chỉ có 1 cuộc họp)
            const meeting = meetings[0];
            const meetingId = meeting._id || meeting.id;
            if (!meetingId) {
                message.error("Không tìm thấy ID cuộc họp");
                return;
            }

            const electionId = delegateData.electionId || currentElectionId;
            const userId = delegateData.userId;

            if (!electionId || !userId) {
                message.error("Thiếu thông tin cuộc bầu cử hoặc người dùng");
                return;
            }

            setLoading(true);

            // Tìm ElectionParticipant đã tồn tại trong cuộc bầu cử (giống QRScannerPanel)
            try {
                const participantResponse: BaseResponse<any> = await ElectionParticipantService.getByUserId(userId);
                const participantList = participantResponse?.data
                    ? (Array.isArray(participantResponse.data) ? participantResponse.data : [participantResponse.data])
                    : [];
                const participant = participantList.find(
                    (p: any) => p.electionId?._id === electionId || p.electionId === electionId
                );

                if (!participant || !participant._id) {
                    message.warning("Người này chưa được thêm vào danh sách tham gia cuộc bầu cử");
                    setLoading(false);
                    return;
                }

                // Thử cập nhật trạng thái tham gia cuộc họp (nếu MeetingAttendee record đã tồn tại)
                try {
                    const updateResult = await MeetingAttendeeService.updateStatusAttendance(
                        meetingId,
                        participant._id,
                        true
                    );
                    // Kiểm tra xem response có data không - nếu null thì record chưa tồn tại, cần tạo mới
                    if (!updateResult?.data || updateResult?.data === null) {
                        throw new Error("Record not found");
                    }
                    console.log("✅ Đã cập nhật trạng thái tham gia cuộc họp thành công");
                    message.success(`✅ Đã xác thực đại biểu: ${delegateData?.fullName}`);
                    setIsModalVisible(false);
                    setDelegateData(null);
                    setParticipantId(null);
                    setSearchText("");
                } catch (updateError: any) {
                    // Nếu MeetingAttendee record chưa tồn tại, tạo mới record ghi nhận tham gia cuộc họp
                    const errorStatus = updateError?.response?.status;
                    const errorMessage = updateError?.message || "";
                    if (errorStatus === 404 || errorStatus === 500 || errorMessage === "Record not found") {
                        console.log("📝 Tạo mới MeetingAttendee record (ghi nhận tham gia cuộc họp)...");
                        await MeetingAttendeeService.create({
                            meetingId: meetingId,
                            participantId: participant._id, // Sử dụng participant đã tồn tại
                            checkInTime: new Date(),
                            attended: true,
                        });
                        console.log("✅ Đã tạo mới MeetingAttendee record và cập nhật trạng thái tham gia thành công");
                        message.success(`✅ Đã xác thực đại biểu: ${delegateData?.fullName}`);
                        setIsModalVisible(false);
                        setDelegateData(null);
                        setParticipantId(null);
                        setSearchText("");
                    } else {
                        throw updateError;
                    }
                }
            } catch (attendanceError: any) {
                console.error("❌ Lỗi khi cập nhật trạng thái tham gia:", attendanceError);
                const errorMsg = attendanceError?.response?.data?.message || attendanceError?.message || "Không thể cập nhật trạng thái tham gia";
                message.error(`❌ ${errorMsg}`);
            }
        } catch (error: any) {
            console.error("❌ Lỗi khi check-in:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Không thể check-in";
            message.error(`❌ ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setDelegateData(null);
        setParticipantId(null);
        setSearchText("");
        message.info("❎ Đã hủy xác nhận.");
    };

    return (
        <>
            <Card
                className="verification-card"
                title={
                    <span className="verification-title">
                        <UserOutlined className="verification-icon" />
                        Xác thực & Hỗ trợ
                    </span>
                }
                bordered={false}
            >
                <Input
                    placeholder="Nhập ID thẻ đại biểu..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleOpenModal}
                    allowClear
                    style={{ marginBottom: 12 }}
                />

                <Button
                    block
                    icon={<UserOutlined />}
                    className="verification-button"
                    onClick={handleOpenModal}
                    loading={loading}
                >
                    Xác thực Check-in Thủ công
                </Button>
            </Card>

            {/* Modal xác nhận đại biểu*/}
            <Modal
                open={isModalVisible}
                title="Xác nhận thông tin đại biểu"
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        Hủy
                    </Button>,
                    <Button 
                        key="save" 
                        type="primary" 
                        onClick={handleSave}
                        style={{ 
                            backgroundColor: '#52c41a', 
                            borderColor: '#52c41a',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#73d13d';
                            e.currentTarget.style.borderColor = '#73d13d';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#52c41a';
                            e.currentTarget.style.borderColor = '#52c41a';
                        }}
                    >
                        Checkin
                    </Button>,
                ]}
            >
                {loading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spin size="large" />
                        <p style={{ marginTop: 16 }}>Đang tải thông tin đại biểu...</p>
                    </div>
                ) : delegateData ? (
                    <div>
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Họ tên">{delegateData.fullName || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Mã đại biểu">{delegateData.code || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Email">{delegateData.email || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{delegateData.phone || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Đơn vị">{delegateData.department || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Chức vụ">{delegateData.position || "N/A"}</Descriptions.Item>
                        {delegateData.electionName && (
                            <Descriptions.Item label="Cuộc bầu cử">{delegateData.electionName}</Descriptions.Item>
                        )}
                    </Descriptions>
                    </div>
                ) : (
                    <p>Không có dữ liệu đại biểu.</p>
                )}
            </Modal>
        </>
    );
};

export default VerificationPanel;
