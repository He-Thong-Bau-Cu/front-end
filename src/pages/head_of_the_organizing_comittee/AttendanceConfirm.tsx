import CheckinLiveList from "@/components/head_of_the_organizing_committee/attendance_confirm/CheckinLiveList";
import CheckinStats from "@/components/head_of_the_organizing_committee/attendance_confirm/CheckinStats";
import CheckinSummary from "@/components/head_of_the_organizing_committee/attendance_confirm/CheckinSummary";
import CheckinTools from "@/components/head_of_the_organizing_committee/attendance_confirm/CheckinTools";
import QuickActions from "@/components/head_of_the_organizing_committee/attendance_confirm/QuickActions";
import { Col, Row } from "antd";
import "../../style/head-of-the-organizing-committee/AttendanceConfirm.model.css";



const AttendanceConfirm = () => {
    return (
        <div className="attendance-container-tracking">

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} md={16}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <CheckinSummary />
                        </Col>
                        <Col xs={24} md={12}>
                            <CheckinStats />
                        </Col>
                        <Col span={24}>
                            <CheckinLiveList />
                        </Col>
                    </Row>
                </Col>

                <Col xs={24} md={8}>
                    <QuickActions />
                    <CheckinTools />

                </Col>
            </Row>
        </div>
    );
};

export default AttendanceConfirm;
