import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

interface BallotStatsListenerProps {
    electionId: string;
    onUpdate: (data: any) => void;
}

const BallotStatsListener: React.FC<BallotStatsListenerProps> = ({
    electionId,
    onUpdate,
}) => {
    useEffect(() => {
        console.log("📌 BallotStatsListener mounted với electionId =", electionId);

        if (!electionId) {
            console.warn("⚠️ Không có electionId → không tạo socket");
            return;
        }

        // 👉 FIX: Dùng root namespace
        const socket: Socket = io("http://54.253.192.210:80", {
            auth: { electionId },
            transports: ["websocket"],
        });

        socket.onAny((event, ...args) => {
            console.log("📡 [SOCKET EVENT]", event, args);
        });

        socket.on("connect", () => {
            console.log("🟢 Socket connected:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("🔴 Lỗi connect socket:", err.message);
        });

        socket.on("transferData", (transferData) => {
            console.log("📥 Nhận ballot:update:", transferData);
            onUpdate(transferData);
        });

        return () => {
            console.log("🔌 Socket disconnected");
            socket.disconnect();
        };
    }, [electionId, onUpdate]);

    return null;
};

export default BallotStatsListener;
