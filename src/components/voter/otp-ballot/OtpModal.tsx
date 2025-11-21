import { Button, Col, Input, Modal, Row, Typography } from "antd";
import { useEffect, useState } from "react";

const { Text } = Typography;

interface Props {
    open: boolean;
    onClose: () => void;
    onVerify: (otp: string) => Promise<void>;
    onResend: () => Promise<void>;
    loading?: boolean;
}

// Format 300s → 05:00
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
};


export default function OtpModal({ open, onClose, onVerify, onResend, loading }: Props) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(300);
    const [canResend, setCanResend] = useState(false);
    const email = localStorage.getItem("email") || "";
    const [restartTimer, setRestartTimer] = useState(0);

    // Đếm ngược resend
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (open) {
            setTimer(300);
            setCanResend(false);

            interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev === 1) {
                        clearInterval(interval);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [open, restartTimer]);

    // Xử lý nhập OTP từng ô
    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto next
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        // Backspace khi ô trống → focus ô trước
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            const prevInput = document.getElementById(`otp-input-${index - 1}`);
            prevInput?.focus();
        }

        // Nhấn Enter → xác thực OTP
        if (e.key === "Enter") {
            const fullOtp = otp.join("");
            if (fullOtp.length === 6) {
                onVerify(fullOtp);
            }
        }
    };


    const handleResend = async () => {
        setOtp(["", "", "", "", "", ""]);
        setTimer(300);
        setCanResend(false);

        setRestartTimer(prev => prev + 1);  // 👈 KÍCH HOẠT USEEFFECT ĐẾM NGƯỢC

        await onResend();
    };


    const handleVerify = () => {
        const fullOtp = otp.join("");
        if (fullOtp.length !== 6) return;

        onVerify(fullOtp);
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width={420}
            bodyStyle={{
                padding: "32px 16px",
                textAlign: "center",
                background: "linear-gradient(to bottom right, #ffffff, #f3fdf4)",
                borderRadius: 20,
            }}
            style={{ borderRadius: 20 }}
        >
            {/* Icon */}
            <div
                style={{
                    width: 80,
                    height: 80,
                    margin: "0 auto 16px",
                    borderRadius: "50%",
                    background: "linear-gradient(180deg, #a6f3a1, #7ed957)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span style={{ fontSize: 40, color: "white" }}>✉️</span>
            </div>

            <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Xác thực Email</h2>

            <Text style={{ fontSize: 14, color: "#666" }}>
                Chúng tôi đã gửi mã xác thực email của bạn
            </Text>
            <br />
            <div
                style={{
                    marginTop: 12,
                    marginBottom: 12,
                    background: "#e8ffe8",
                    display: "inline-block",
                    padding: "6px 16px",
                    borderRadius: 20,
                    fontWeight: 600,
                    color: "#34aa44",
                }}
            >
                {email}
            </div>
            <br />
            <Text type="secondary" style={{ fontSize: 13 }}>
                Vui lòng kiểm tra hộp thư đến hoặc spam
            </Text>

            {/* OTP 6 ô */}
            <Row justify="space-between" style={{ marginTop: 24 }}>
                {otp.map((value, index) => (
                    <Col key={index}>
                        <Input
                            id={`otp-input-${index}`}
                            value={value}
                            maxLength={1}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            style={{
                                width: 48,
                                height: 56,
                                fontSize: 24,
                                textAlign: "center",
                                borderRadius: 12,
                                border: "1px solid #d9d9d9",
                            }}
                        />
                    </Col>
                ))}
            </Row>

            {/* BUTTON VERIFY */}
            <Button
                type="primary"
                block
                size="large"
                loading={loading}
                onClick={handleVerify}
                style={{
                    marginTop: 32,
                    height: 48,
                    borderRadius: 12,
                    background: "#a7e887",
                    borderColor: "#a7e887",
                    fontSize: 16,
                    fontWeight: 600,
                    outline: "none",
                }}
                disabled={otp.join("").length !== 6}
            >
                Xác thực
            </Button>

            {/* RESEND */}
            <div style={{ marginTop: 20, fontSize: 14 }}>
                {/* <Text type="secondary">Không nhận được mã?</Text> */}
                <br />

                {canResend ? (
                    <Button
                        type="link"
                        style={{ color: "#34aa44", fontWeight: 600 }}
                        onClick={handleResend}
                    >
                        Gửi lại mã xác thực
                    </Button>
                ) : (
                    <Text style={{ color: "#34aa44" }}>  Gửi lại sau {formatTime(timer)}</Text>
                )}

            </div>

        </Modal>
    );
}
