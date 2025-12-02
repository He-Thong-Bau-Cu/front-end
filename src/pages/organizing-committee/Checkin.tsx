import { Row, Col } from "antd";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import QRScannerPanel from "@/components/organizing-committee/checkin/QRScannerPanel";
import CheckinSidebar from "@/components/organizing-committee/checkin/CheckinSidebar";
import ElectionService from "@/services/ElectionService";
import { SOCKET_URL } from "@/config/socket";
import '../../style/organizing-committee/Checkin.model.css'

const Checkin: React.FC = () => {
    const [canCheckin, setCanCheckin] = useState(false);
    const [checkinStage, setCheckinStage] = useState<any>(null);

    // Helper function để tính toán currentStage từ timeline và stages
    const calculateCurrentStage = (timeline: any, stages: any) => {
        let currentStage = 'not_started';
        let stageStartedAt: Date | null = null;
        let stageStatus = 'NOT_STARTED';

        // Kiểm tra từng giai đoạn theo thứ tự (logic giống backend)
        if (timeline.checkinAt && stages.checkin !== 'COMPLETED') {
            currentStage = 'checkin';
            stageStartedAt = timeline.checkinAt ?? null;
            stageStatus = 'STARTED';
        } else if (stages.checkin === 'COMPLETED' && timeline.reportAt && stages.report !== 'COMPLETED') {
            currentStage = 'report';
            stageStartedAt = timeline.reportAt ?? null;
            stageStatus = 'STARTED';
        } else if (stages.report === 'COMPLETED' && timeline.votingAt && stages.voting !== 'COMPLETED') {
            currentStage = 'voting';
            stageStartedAt = timeline.votingAt ?? null;
            stageStatus = 'STARTED';
        } else if (stages.voting === 'COMPLETED' && timeline.resultAnnouncedAt && stages.result !== 'COMPLETED') {
            currentStage = 'result';
            stageStartedAt = timeline.resultAnnouncedAt ?? null;
            stageStatus = 'STARTED';
        } else if (stages.result === 'COMPLETED' && timeline.closingAt && stages.closing !== 'COMPLETED') {
            currentStage = 'closing';
            stageStartedAt = timeline.closingAt ?? null;
            stageStatus = 'STARTED';
        } else if (stages.closing === 'COMPLETED') {
            currentStage = 'completed';
            stageStartedAt = timeline.closingAt ?? null;
            stageStatus = 'COMPLETED';
        } else if (timeline.checkinAt) {
            // Nếu đã có timeline nhưng không match với điều kiện nào, lấy giai đoạn cuối cùng đã completed
            if (stages.closing === 'COMPLETED') {
                currentStage = 'completed';
                stageStartedAt = timeline.closingAt ?? null;
                stageStatus = 'COMPLETED';
            } else if (stages.result === 'COMPLETED') {
                currentStage = 'result';
                stageStartedAt = timeline.resultAnnouncedAt ?? null;
                stageStatus = 'COMPLETED';
            } else if (stages.voting === 'COMPLETED') {
                currentStage = 'voting';
                stageStartedAt = timeline.votingAt ?? null;
                stageStatus = 'COMPLETED';
            } else if (stages.report === 'COMPLETED') {
                currentStage = 'report';
                stageStartedAt = timeline.reportAt ?? null;
                stageStatus = 'COMPLETED';
            } else if (stages.checkin === 'COMPLETED') {
                currentStage = 'checkin';
                stageStartedAt = timeline.checkinAt ?? null;
                stageStatus = 'COMPLETED';
            }
        }

        return {
            currentStage,
            stageStartedAt,
            stageStatus,
            timeline,
            stages,
        };
    };

    // Cập nhật state từ stageData (có thể từ API hoặc từ socket payload)
    const updateStageState = (stageData: any) => {
        setCheckinStage(stageData);

        // Kiểm tra xem có thể checkin không (chỉ khi giai đoạn checkin đang STARTED)
        const isCheckinActive =
            stageData?.currentStage === 'checkin' &&
            stageData?.stageStatus === 'STARTED';

        setCanCheckin(isCheckinActive);
    };

    // Kiểm tra trạng thái checkin
    const checkCheckinStage = async () => {
        try {
            const electionId = localStorage.getItem("currentElectionId");
            if (!electionId) {
                setCanCheckin(false);
                return;
            }

            const stageResponse = await ElectionService.getCurrentStage(electionId);
            const stageData = stageResponse?.data || stageResponse;

            updateStageState(stageData);
        } catch (error: any) {
            console.error("Error checking checkin stage:", error);
            setCanCheckin(false);
        }
    };

    // Setup socket listener để nhận cập nhật realtime
    useEffect(() => {
        const electionId = localStorage.getItem("currentElectionId");
        if (!electionId) return;

        const socket: Socket = io(SOCKET_URL, {
            transports: ["websocket"],
        });

        socket.on("connect", () => {
            console.log("Socket connected for checkin stage:", socket.id);
            socket.emit("join", electionId);
        });

        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err.message);
        });

        // Lắng nghe cập nhật trạng thái giai đoạn
        socket.on("transferData", (data: any) => {
            if (data.type === "stage-started" || data.type === "stage-ended") {
                console.log("📊 Received stage update:", data);
                // Refresh trạng thái khi có cập nhật
                checkCheckinStage();
            }
        });

        // Lắng nghe socket transferStateDataRT khi trạng thái cuộc họp thay đổi
        socket.on("transferStateDataRT", (data: any) => {
            if (data.type === "meeting-status-changed" && data.payload) {
                console.log("📊 Received meeting status update:", data);

                // Sử dụng payload trực tiếp thay vì gọi lại API
                const payload = data.payload;
                if (payload.election) {
                    const election = payload.election;
                    const timeline = election.timeline || {};
                    const stages = election.stages || {};

                    // Tính toán currentStage từ timeline và stages
                    const stageData = calculateCurrentStage(timeline, stages);

                    // Thêm các thông tin khác từ election
                    const fullStageData = {
                        ...stageData,
                        startDate: election.startDate,
                    };

                    // Cập nhật state trực tiếp từ payload, không cần gọi API
                    updateStageState(fullStageData);
                }
            }
        });

        return () => {
            socket.disconnect();
            console.log("Socket disconnected for checkin stage");
        };
    }, []);

    // Kiểm tra trạng thái khi component mount
    useEffect(() => {
        checkCheckinStage();
    }, []);

    return (
        <div className="checkin-container">
            <Row gutter={[24, 0]}>
                <Col xs={24} lg={16}>
                    <QRScannerPanel canCheckin={canCheckin} checkinStage={checkinStage} />
                </Col>

                <Col xs={24} lg={8}>
                    <CheckinSidebar canCheckin={canCheckin} />
                </Col>
            </Row>
        </div>
    );
};

export default Checkin;
