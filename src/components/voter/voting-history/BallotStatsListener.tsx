import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config/socket";

interface BallotStatsListenerProps {
    electionId: string;
    onUpdate: (data: any) => void;
}

const BallotStatsListener: React.FC<BallotStatsListenerProps> = ({
    electionId,
    onUpdate,
}) => {
    const callbackRef = useRef<typeof onUpdate>(undefined);

    // keep latest handler without re-subscribing socket
    useEffect(() => {
        callbackRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        console.log("📌 BallotStatsListener mounted với electionId =", electionId);

        if (!electionId) {
            console.warn("⚠️ Không có electionId → không tạo socket");
            return;
        }

        // 👉 FIX: Dùng root namespace
        const socket: Socket = io(SOCKET_URL, {
            auth: { electionId },
            transports: ["websocket"],
        });

        socket.onAny((event, ...args) => {
            console.log("📡 [SOCKET EVENT]", event, args);
        });

        socket.on("connect", () => {
            console.log("🟢 Socket ballot connected:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("🔴 Lỗi connect socket ballot:", err.message);
        });

        socket.on("transferData", (transferData) => {
            console.log("📥 Nhận ballot:update:", transferData);
            callbackRef.current?.(transferData);
        });

        return () => {
            console.log("🔌 Socket ballot disconnected");
            socket.disconnect();
        };
    }, [electionId]);

    return null;
};

export default BallotStatsListener;
