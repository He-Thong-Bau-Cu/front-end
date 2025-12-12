import React, { useEffect, useState } from "react";
import CheckinLiveList from "@/components/head_of_the_organizing_committee/attendance_confirm/CheckinLiveList";
import CheckinStats from "@/components/head_of_the_organizing_committee/attendance_confirm/CheckinStats";
import CheckinSummary from "@/components/head_of_the_organizing_committee/attendance_confirm/CheckinSummary";
import { Col, Row, Spin, message } from "antd";
import MeetingService from "@/services/MeetingService";
import MeetingAttendeeService from "@/services/MeetingAttendeeService";
import BallotService from "@/services/BallotService";
import "../../style/head-of-the-organizing-committee/AttendanceConfirm.model.css";
import { formatDateNoOffset2 } from "@/utils/format";

interface AttendanceData {
    totalAttendees: number;
    checkedInCount: number;
    notCheckedInCount: number;
    checkinPercent: number;
    recentCheckins: any[];
    meeting?: any;
    election?: any;
}

const AttendanceConfirm = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AttendanceData>({
        totalAttendees: 0,
        checkedInCount: 0,
        notCheckedInCount: 0,
        checkinPercent: 0,
        recentCheckins: [],
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const electionId = localStorage.getItem("currentElectionId");
            if (!electionId) {
                message.warning("Vui lòng chọn cuộc bầu cử từ trang chủ");
                return;
            }

            // Lấy thống kê từ event management stats
            const statsResponse = await MeetingService.getEventManagementStats(electionId);
            const statsData = statsResponse?.data || statsResponse;

            const meeting = statsData.meeting;
            const stats = statsData.stats;

            if (!meeting?._id) {
                message.error("Không tìm thấy thông tin cuộc họp");
                return;
            }

            // Lấy danh sách tất cả meeting attendees
            const attendeesResponse = await MeetingAttendeeService.getByMeetingId(meeting._id);
            const attendeesData = attendeesResponse?.data || attendeesResponse || [];
            const attendeesList = Array.isArray(attendeesData) ? attendeesData : (attendeesData?.data || []);

            // Lấy danh sách tất cả ballots để check xem ai đã có phiếu bầu cử
            const ballotsResponse: any = await BallotService.getAllBallotsByElectionId(electionId);
            // Xử lý cả 2 trường hợp: ballotsResponse có thể là Ballot[] hoặc BaseResponse<Ballot[]>
            const ballotsData = Array.isArray(ballotsResponse)
                ? ballotsResponse
                : (ballotsResponse?.data || ballotsResponse || []);
            const ballotsList = Array.isArray(ballotsData) ? ballotsData : [];

            // Tạo map userId -> hasBallot để check nhanh
            // Ballot có voterId, voterId có userId
            const ballotMap = new Map();
            ballotsList.forEach((ballot: any) => {
                const ballotUserId = ballot?.voterId?.userId?._id?.toString() ||
                                    ballot?.voterId?.userId?.toString() ||
                                    ballot?.voterId?._id?.toString() ||
                                    ballot?.voterId?.toString();
                if (ballotUserId) {
                    ballotMap.set(ballotUserId, true);
                }
            });

            // Map danh sách attendees với thông tin check-in và ballot
            const attendeesWithStatus = attendeesList
                .map((item: any) => {
                    const participant = item?.participantId || {};
                    const user = participant?.userId || {};
                    const userId = user?._id?.toString() ||
                                  user?.id?.toString() ||
                                  participant?.userId?._id?.toString() ||
                                  "N/A";
                    const userName = user?.fullName ||
                                    user?.username ||
                                    user?.email ||
                                    "Chưa có tên";
                    const checkInTime = item?.checkInTime || item?.createdAt || item?.updatedAt;
                    const hasCheckedIn = item?.attended === true;
                    const hasBallot = ballotMap.has(userId);

                    return {
                        id: userId,
                        name: userName,
                        email: user?.email || "",
                        phone: user?.phone || "",
                        checkInTime: checkInTime,
                        hasCheckedIn: hasCheckedIn,
                        hasBallot: hasBallot,
                        checkInTimeFormatted: formatDateNoOffset2(checkInTime),
                    };
                })
                .sort((a: any, b: any) => {
                    // Sắp xếp: đã check-in trước, chưa check-in sau
                    if (a.hasCheckedIn !== b.hasCheckedIn) {
                        return b.hasCheckedIn ? 1 : -1;
                    }
                    // Nếu cùng trạng thái, sắp xếp theo thời gian check-in (mới nhất trước)
                    if (a.checkInTime && b.checkInTime) {
                        return new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime();
                    }
                    return 0;
                });

            setData({
                totalAttendees: stats?.totalAttendees || 0,
                checkedInCount: stats?.checkedInCount || 0,
                notCheckedInCount: stats?.totalAttendees - (stats?.checkedInCount || 0),
                checkinPercent: stats?.checkinPercent || 0,
                recentCheckins: attendeesWithStatus,
                meeting,
                election: statsData.election,
            });
        } catch (error: any) {
            console.error("Error loading attendance data:", error);
            message.error(error?.response?.data?.message || "Không thể tải dữ liệu xác nhận tham dự");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading && !data.totalAttendees) {
        return (
            <div className="attendance-container-tracking" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="attendance-container-tracking">
            <Row gutter={[32, 32]} style={{ marginTop: 32 }}>
                <Col xs={24}>
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={12}>
                            <CheckinSummary
                                totalAttendees={data.totalAttendees}
                                checkedInCount={data.checkedInCount}
                                checkinPercent={data.checkinPercent}
                            />
                        </Col>
                        <Col xs={24} md={12}>
                            <CheckinStats
                                checkedInCount={data.checkedInCount}
                                notCheckedInCount={data.notCheckedInCount}
                                totalAttendees={data.totalAttendees}
                            />
                        </Col>
                        <Col span={24} style={{ marginTop: 8 }}>
                            <CheckinLiveList
                                recentCheckins={data.recentCheckins}
                                onRefresh={loadData}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
};

export default AttendanceConfirm;
