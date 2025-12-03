import React, { useEffect, useState } from "react";
import { Checkbox, Button, Table } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { VoteVerificationProps } from "../../../types/ElectionVerification.interface";

interface VoteVerificationDetailProps extends VoteVerificationProps {
    initialConfirmed?: boolean;
    onApprove?: () => Promise<void> | void;
    approving?: boolean;
    canSign?: boolean;
}

export default function VoteVerificationDetail({
    verification,
    logs,
    initialConfirmed,
    onApprove,
    approving,
    canSign = true,
}: VoteVerificationDetailProps) {
    const [checked, setChecked] = useState<boolean>(!!initialConfirmed);

    useEffect(() => {
        setChecked(!!initialConfirmed);
    }, [initialConfirmed]);

    const columns = [
        {
            title: "Mã Phiếu",
            dataIndex: "id",
            key: "id",
            render: (text: string) => (
                <span className="ev-vote-id">{text}</span>
            ),
        },
        {
            title: "Thời gian Ghi nhận",
            dataIndex: "time",
            key: "time",
            render: (text: string) => (
                <span className="ev-vote-time">{text}</span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (text: string) => (
                <span className="ev-vote-status">{text}</span>
            ),
        },
    ];

    return (
        <>
            {/* === 3. Kiểm tra Toàn vẹn & Đối soát === */}
            <section className="ev-section">
                <h3 className="ev-section-title">3. Kiểm tra Toàn vẹn & Đối soát</h3>
                <div className="ev-verify-container">
                    <div className="ev-verify-row">
                        <span className="ev-verify-label">Tổng số Check-in được ghi nhận:</span>
                        <span className="ev-verify-value">
                            {verification.totalCheckin.toLocaleString()}
                        </span>
                    </div>
                    <div className="ev-verify-row">
                        <span className="ev-verify-label">Tổng số Phiếu bầu được ghi nhận:</span>
                        <span className="ev-verify-value">
                            {verification.totalVotes.toLocaleString()}
                        </span>
                    </div>
                    <div className="ev-verify-row">
                        <span className="ev-verify-label">Đối soát Dữ liệu:</span>
                        <span
                            className={`ev-verify-value ${verification.isDataValid ? "ev-valid" : "ev-invalid"
                                }`}
                        >
                            {verification.isDataValid ? "HỢP LỆ" : "KHÔNG HỢP LỆ"}
                        </span>
                    </div>
                    <div className="ev-verify-row">
                        <span className="ev-verify-label">Data Checksum (Trước):</span>
                        <span className="ev-verify-checksum">{verification.checksumBefore}</span>
                    </div>
                    <div className="ev-verify-row">
                        <span className="ev-verify-label">Data Checksum (Sau):</span>
                        <span className="ev-verify-checksum">{verification.checksumAfter}</span>
                    </div>
                </div>
            </section>

            {/* === 4. Nhật ký Bỏ phiếu (Ẩn danh) === */}
            <section className="ev-section">
                <h3 className="ev-section-title">4. Nhật ký Bỏ phiếu (Ẩn danh)</h3>

                <div className="ev-votelog-table">
                    <Table
                        dataSource={logs}
                        columns={columns}
                        pagination={false}
                        rowKey="id"
                    />
                </div>

                {/* === Khu vực Ký số & Công bố Kết quả === */}
                <div className="ev-sign-box">
                    <h4 className="ev-sign-title">Khu vực Ký số & Công bố Kết quả</h4>
                    <div>
                        <Checkbox
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                            disabled={initialConfirmed}
                        >
                            Tôi xác nhận đã kiểm tra, đối soát và công nhận kết quả
                            trên là chính xác và minh bạch.
                        </Checkbox>
                    </div>
                    <div>
                        <Button
                            icon={<EditOutlined />}
                            type="primary"
                            className="ev-sign-btn"
                            disabled={!checked || !!initialConfirmed || !canSign}
                            loading={approving}
                            onClick={onApprove}
                            title={!canSign ? "Chưa đến giai đoạn công bố kết quả" : ""}
                        >
                            {initialConfirmed ? "Đã công bố kết quả" : "Ký số & Công bố Kết quả"}
                        </Button>
                    </div>
                </div>
            </section>
        </>
    );
}
