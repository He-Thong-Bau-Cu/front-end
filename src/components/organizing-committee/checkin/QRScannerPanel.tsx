import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Modal, Descriptions, Spin, Alert } from "antd";
import { ArrowLeftOutlined, QrcodeOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import DelegateCardService from "@/services/DelegateCardService";
import MeetingAttendeeService from "@/services/MeetingAttendeeService";
import ElectionService from "@/services/ElectionService";
import { BaseResponse } from "@/types/BaseResponse.interface";
import { useNotification } from "@/contexts/NotificationContext";
import { io, Socket } from "socket.io-client";

const QRScannerPanel: React.FC = () => {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [delegateData, setDelegateData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [checkinStage, setCheckinStage] = useState<any>(null); // Trạng thái giai đoạn checkin
  const [canCheckin, setCanCheckin] = useState(false); // Có thể checkin hay không
  const isProcessingRef = useRef(false); // Flag để ngăn quét lại khi đang xử lý (dùng ref vì callback không cập nhật state)
  const lastProcessedTokenRef = useRef<string | null>(null); // Lưu token đã xử lý để tránh xử lý lại
  const scannerReadyRef = useRef(false); // Flag để đảm bảo scanner đã sẵn sàng trước khi xử lý QR code
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null); // Timer để debounce các lần quét
  const scannerRef = useRef<Html5Qrcode | null>(null); // Ref để lưu scanner instance

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

      setCheckinStage(stageData);

      // Kiểm tra xem có thể checkin không (chỉ khi giai đoạn checkin đang STARTED)
      const isCheckinActive =
        stageData?.currentStage === 'checkin' &&
        stageData?.stageStatus === 'STARTED';

      setCanCheckin(isCheckinActive);
    } catch (error: any) {
      console.error("Error checking checkin stage:", error);
      setCanCheckin(false);
    }
  };

  // Setup socket listener để nhận cập nhật realtime
  useEffect(() => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) return;

    const socket: Socket = io("http://54.253.192.210:80/notification", {
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

    return () => {
      socket.disconnect();
      console.log("Socket disconnected for checkin stage");
    };
  }, []);

  // Kiểm tra trạng thái khi component mount
  useEffect(() => {
    checkCheckinStage();
  }, []);

  useEffect(() => {
    // Không bật camera nếu không thể checkin
    if (!canCheckin) {
      return;
    }

    const elementId = "qr-reader-element";
    const scanner = new Html5Qrcode(elementId, false); // verbose = false để tránh spam console với NotFoundException
    scannerRef.current = scanner;

    // Override console.error/warn tạm thời để lọc bỏ lỗi "NotFoundException" từ html5-qrcode
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.error = (...args: any[]) => {
      const message = args.join(' ');
      // Bỏ qua lỗi "NotFoundException" từ html5-qrcode vì đây là hành vi bình thường
      if (message.includes('NotFoundException') || message.includes('No MultiFormat Readers')) {
        return; // Không log lỗi này
      }
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      const message = args.join(' ');
      if (message.includes('NotFoundException') || message.includes('No MultiFormat Readers')) {
        return; // Không log cảnh báo này
      }
      originalConsoleWarn.apply(console, args);
    };

    const startScanner = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 400)); // đợi DOM render

        console.log("🎥 Đang khởi động camera...");

        // Tính toán kích thước qrbox động dựa trên viewport
        const getQRBoxSize = () => {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          // Tăng kích thước qrbox để dễ quét hơn - lấy 90% chiều rộng nhỏ hơn, tối đa 500px, tối thiểu 250px
          const size = Math.min(Math.max(Math.min(viewportWidth, viewportHeight) * 0.9, 250), 500);
          console.log("📐 QR Box size:", size);
          return { width: size, height: size };
        };

        await scanner.start(
          {
            facingMode: "environment",
          },
          {
            fps: 60,
            qrbox: getQRBoxSize(),
            aspectRatio: 1.0,
            disableFlip: false,
            videoConstraints: {
              facingMode: "environment",
              width: { ideal: 1920, min: 1280 },
              height: { ideal: 1080, min: 720 },
              focusMode: "continuous", // Tự động lấy nét liên tục
            } as MediaTrackConstraints,
          },
          async (decodedText: string) => {
            // decodedText là token từ QR code
            console.log("✅ QR Code detected! Raw token:", decodedText);

            // Kiểm tra xem có thể checkin không
            if (!canCheckin) {
              notify("❌ Giai đoạn checkin chưa bắt đầu hoặc đã kết thúc", "warning");
              return;
            }

            // Kiểm tra xem scanner đã sẵn sàng chưa (tránh trigger ngay khi mở camera)
            if (!scannerReadyRef.current) {
              console.log("⏸️ Scanner chưa sẵn sàng, bỏ qua...");
              return;
            }

            // Ngăn quét lại nếu đang xử lý
            if (isProcessingRef.current) {
              console.log("⏸️ Đang xử lý request trước đó, bỏ qua...");
              return;
            }

            // Làm sạch token: trim khoảng trắng và ký tự đặc biệt
            const cleanedToken = decodedText.trim();

            // Kiểm tra token có hợp lệ không (ít nhất phải có độ dài tối thiểu)
            if (!cleanedToken || cleanedToken.length < 10) {
              console.log("⏸️ Token không hợp lệ, bỏ qua...");
              return;
            }

            // Kiểm tra xem token này đã được xử lý chưa (tránh xử lý lại cùng một QR code)
            if (lastProcessedTokenRef.current === cleanedToken) {
              console.log("⏸️ Token này đã được xử lý trước đó, bỏ qua...");
              return;
            }

            // Debounce: Xóa timer cũ nếu có
            if (debounceTimerRef.current) {
              clearTimeout(debounceTimerRef.current);
            }

            // Đợi 300ms để đảm bảo không có lần quét tiếp theo (debounce)
            debounceTimerRef.current = setTimeout(async () => {
              isProcessingRef.current = true;
              lastProcessedTokenRef.current = cleanedToken; // Lưu token đã xử lý

            try {
              setLoading(true);

              const tokenResponse: BaseResponse<any> = await DelegateCardService.getByToken(cleanedToken);

              if (!tokenResponse || !tokenResponse.success) {
                const errorMsg = tokenResponse?.message || "Không tìm thấy thông tin thẻ đại biểu";
                notify(`❌ ${errorMsg}`, "error");
                setLoading(false);
                isProcessingRef.current = false;
                return;
              }

              if (!tokenResponse.data) {
                notify("❌ Không tìm thấy thông tin thẻ đại biểu. Token có thể không hợp lệ hoặc đã hết hạn.", "error");
                setLoading(false);
                isProcessingRef.current = false;
                return;
              }

              // Lấy thông tin đại biểu từ response
              const delegateCard = tokenResponse.data;

              // Lấy thông tin voter từ delegateCard
              const voter = delegateCard.voterId;
              if (!voter || !voter.userId) {
                notify("Không tìm thấy thông tin cử tri", "error");
                setLoading(false);
                return;
              }

              // Map dữ liệu để hiển thị trong modal
              // Backend populate voterId với userId, nên truy cập qua voter.userId
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

              setDelegateData(delegateInfo);
              setIsModalVisible(true);
              // Dừng camera sau khi đã lấy được thông tin
              await stopScanner();
              notify("✅ Đã quét mã thành công", "success");
              // KHÔNG tự động check-in nữa, chỉ hiển thị modal thông tin
            } catch (error: any) {
              console.error("❌ Lỗi khi lấy thông tin thẻ đại biểu:", error);
              console.error("❌ Error details:", {
                message: error?.message,
                response: error?.response,
                responseData: error?.response?.data,
                status: error?.response?.status,
                token: cleanedToken,
              });

              // Lấy thông báo lỗi từ response hoặc error message
              let errorMessage = "Không thể lấy thông tin thẻ đại biểu";

              if (error?.response?.data?.message) {
                // Lỗi từ backend (500, 404, etc.)
                errorMessage = error.response.data.message;
              } else if (error?.response?.data?.error) {
                // Lỗi từ NestJS exception
                errorMessage = error.response.data.error || error.response.data.message || errorMessage;
              } else if (error?.message) {
                // Lỗi từ client
                errorMessage = error.message;
              }

              console.error("❌ Final error message:", errorMessage);
              notify(`❌ ${errorMessage}`, "error");
              // Không dừng camera nếu lỗi, để có thể quét lại
            } finally {
              setLoading(false);
              // Chỉ reset flag sau 2 giây để tránh quét lại ngay lập tức
              setTimeout(() => {
                isProcessingRef.current = false;
                lastProcessedTokenRef.current = null; // Reset token sau 2 giây
              }, 2000);
            }
            }, 300); // Đóng setTimeout debounce - đợi 300ms trước khi xử lý
          },
          (errorMessage: string) => {
            // Callback này được gọi khi có lỗi trong quá trình quét (không phải lỗi API)
            // Bỏ qua lỗi "NotFoundException" vì đây là lỗi bình thường khi scanner đang tìm kiếm QR code
            if (errorMessage.includes("NotFoundException") || errorMessage.includes("No MultiFormat Readers")) {
              // Không log lỗi này vì đây là hành vi bình thường của scanner
              return;
            }

            // Chỉ log các lỗi quan trọng
            console.warn("⚠️ QR Scanner error:", errorMessage);

            // Chỉ hiển thị message cho lỗi quan trọng
            if (errorMessage.includes("NotAllowedError")) {
              notify("❌ Quyền camera bị chặn. Hãy cấp lại quyền trong trình duyệt.", "error");
            } else if (errorMessage.includes("NotFoundError")) {
              notify("❌ Không tìm thấy camera. Vui lòng kiểm tra thiết bị.", "error");
            }
          }
        );

        console.log("✅ Camera đã khởi động thành công!");
        // Đánh dấu scanner đã sẵn sàng sau 1 giây (để tránh trigger ngay khi mở camera)
        setTimeout(() => {
          scannerReadyRef.current = true;
        }, 1000);
      } catch (err: any) {
        console.error("❌ Không thể bật camera:", err);
        console.error("❌ Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });

        if (err.name === "NotAllowedError" || err.message?.includes("NotAllowedError")) {
          notify("❌ Bạn chưa cấp quyền truy cập camera. Vui lòng cấp quyền và tải lại trang.", "error");
        } else if (err.name === "NotFoundError" || err.message?.includes("NotFoundError")) {
          notify("❌ Không tìm thấy thiết bị camera nào. Vui lòng kiểm tra thiết bị.", "error");
        } else if (err.name === "OverconstrainedError" || err.message?.includes("OverconstrainedError")) {
          notify("❌ Camera không hỗ trợ cấu hình yêu cầu. Đang thử cấu hình khác...", "error");
          // Có thể thử lại với cấu hình đơn giản hơn
        } else {
          notify(`❌ Không thể bật camera: ${err.message || "Lỗi không xác định"}`, "error");
        }
      }
    };

    // 👉 Hàm dừng camera an toàn
    const stopScanner = async () => {
      try {
        const state = scanner.getState?.();
        if (
          state === Html5QrcodeScannerState.SCANNING ||
          state === Html5QrcodeScannerState.PAUSED
        ) {
          await scanner.stop();
          await scanner.clear();
        }
      } catch (e) {
        console.warn("⚠️ Bỏ qua lỗi khi dừng camera:", e);
      }
    };

    startScanner();

    // Cleanup khi rời trang
    return () => {
      stopScanner();
      // Clear debounce timer nếu có
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // Khôi phục lại console.error và console.warn ban đầu
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [canCheckin]);

  // 👉 Khi nhấn "Checkin" trong modal
  const handleSave = async () => {
    try {
      if (!delegateData) {
        notify("Không có thông tin đại biểu", "error");
        return;
      }

      // Kiểm tra lại trạng thái checkin trước khi checkin
      if (!canCheckin) {
        notify("❌ Giai đoạn checkin chưa bắt đầu hoặc đã kết thúc", "warning");
        return;
      }

      // Lấy cuộc bầu cử từ localStorage (đã chọn ở trang home)
      const currentElectionId = localStorage.getItem("currentElectionId");
      if (!currentElectionId) {
        notify("Vui lòng chọn cuộc bầu cử từ trang chủ", "warning");
        return;
      }

      const electionId = delegateData.electionId || currentElectionId;
      const userId = delegateData.userId;

      if (!electionId || !userId) {
        notify("Thiếu thông tin cuộc bầu cử hoặc người dùng", "error");
        return;
      }

      setLoading(true);

      // Gọi API check-in (backend sẽ tự xử lý tất cả logic)
      const checkInResult = await MeetingAttendeeService.checkIn(electionId, userId);

      if (checkInResult?.success && checkInResult?.data) {
        notify(`✅ Đã check-in đại biểu: ${delegateData?.fullName}`, "success");
        setIsModalVisible(false);
        setDelegateData(null);
        // Bật lại camera để tiếp tục quét
        await handleCancel();
      } else {
        const errorMsg = checkInResult?.message || "Không thể check-in";
        notify(`❌ ${errorMsg}`, "error");
      }
    } catch (error: any) {
      console.error("❌ Lỗi khi check-in:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Không thể check-in";
      notify(`❌ ${errorMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // 👉 Khi nhấn "Hủy"
  const handleCancel = async () => {
    setIsModalVisible(false);
    setDelegateData(null);
    notify("❎ Đã hủy xác nhận.", "info");

    // Bật lại camera sau khi đóng modal
    try {
      const elementId = "qr-reader-element";
      const scanner = new Html5Qrcode(elementId, false); // verbose = false để tránh spam console
      const getQRBoxSize = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const size = Math.min(Math.max(Math.min(viewportWidth, viewportHeight) * 0.7, 250), 400);
        return { width: size, height: size };
      };

      await scanner.start(
        {
          facingMode: "environment",
          aspectRatio: 1.0,
        },
        {
          fps: 30, // Tăng FPS lên 30 để quét nhanh hơn
          qrbox: getQRBoxSize(),
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            focusMode: "continuous",
          } as MediaTrackConstraints,
        },
        async (decodedText: string) => {
          console.log("🔍 Token từ QR code (retry):", decodedText);

          // Ngăn quét lại nếu đang xử lý
          if (isProcessingRef.current) {
            console.log("⏸️ Đang xử lý request trước đó (retry), bỏ qua...");
            return;
          }

          // Làm sạch token: trim khoảng trắng và ký tự đặc biệt
          const cleanedToken = decodedText.trim();

          // Kiểm tra xem token này đã được xử lý chưa
          if (lastProcessedTokenRef.current === cleanedToken) {
            console.log("⏸️ Token này đã được xử lý trước đó (retry), bỏ qua...");
            return;
          }

          isProcessingRef.current = true;
          lastProcessedTokenRef.current = cleanedToken;

          try {
            setLoading(true);

            console.log("📡 Step 1 (retry): Calling getByToken with cleaned token:", cleanedToken);

            // Bước 1: Lấy thông tin thẻ đại biểu từ token
            const tokenResponse: BaseResponse<any> = await DelegateCardService.getByToken(cleanedToken);
            console.log("📥 Step 1 Response (retry):", tokenResponse);

            // Kiểm tra response và data
            if (!tokenResponse || !tokenResponse.success) {
              const errorMsg = tokenResponse?.message || "Không tìm thấy thông tin thẻ đại biểu";
              console.error("❌ API Response Error (retry):", errorMsg);
              notify(`❌ ${errorMsg}`, "error");
              setLoading(false);
              return;
            }

            if (!tokenResponse.data) {
              console.error("❌ API Response data is null (retry)");
              notify("❌ Không tìm thấy thông tin thẻ đại biểu. Token có thể không hợp lệ hoặc đã hết hạn.", "error");
              setLoading(false);
              return;
            }

            // Lấy thông tin đại biểu từ response
            const delegateCard = tokenResponse.data;

            const voter = delegateCard.voterId;
            if (!voter || !voter.userId) {
              notify("Không tìm thấy thông tin cử tri", "error");
              setLoading(false);
              return;
            }

            // Backend populate voterId với userId, nên truy cập qua voter.userId
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

            setDelegateData(delegateInfo);
            setIsModalVisible(true);
            await scanner.stop();
            await scanner.clear();
            notify("✅ Đã quét mã thành công", "success");
            // KHÔNG tự động check-in nữa, chỉ hiển thị modal thông tin
          } catch (error: any) {
            console.error("❌ Lỗi khi lấy thông tin thẻ đại biểu (retry):", error);
            console.error("❌ Error details (retry):", {
              message: error?.message,
              response: error?.response,
              responseData: error?.response?.data,
              status: error?.response?.status,
              token: cleanedToken,
            });

            // Lấy thông báo lỗi từ response hoặc error message
            let errorMessage = "Không thể lấy thông tin thẻ đại biểu";

            if (error?.response?.data?.message) {
              // Lỗi từ backend (500, 404, etc.)
              errorMessage = error.response.data.message;
            } else if (error?.response?.data?.error) {
              // Lỗi từ NestJS exception
              errorMessage = error.response.data.error || error.response.data.message || errorMessage;
            } else if (error?.message) {
              // Lỗi từ client
              errorMessage = error.message;
            }

            console.error("❌ Final error message (retry):", errorMessage);
            notify(`❌ ${errorMessage}`, "error");
          } finally {
            setLoading(false);
            // Chỉ reset flag sau 2 giây để tránh quét lại ngay lập tức
            setTimeout(() => {
              isProcessingRef.current = false;
              lastProcessedTokenRef.current = null;
            }, 2000);
          }
        },
        (error: unknown) => {
          // Bỏ qua lỗi "NotFoundException" vì đây là lỗi bình thường
          if (typeof error === "string") {
            if (error.includes("NotFoundException") || error.includes("No MultiFormat Readers")) {
              return; // Không log lỗi này
            }
            if (error.includes("NotAllowedError")) {
              notify("❌ Quyền camera bị chặn. Hãy cấp lại quyền trong trình duyệt.", "error");
            }
          }
        }
      );
    } catch (err) {
      console.warn("⚠️ Không thể bật lại camera:", err);
    }
  };

  // Hiển thị thông báo trạng thái
  const getStageMessage = () => {
    if (!checkinStage) {
      return null;
    }

    if (checkinStage.currentStage === 'checkin' && checkinStage.stageStatus === 'STARTED') {
      return null; // Không hiển thị gì khi đang active
    }

    if (checkinStage.currentStage === 'not_started' ||
        (checkinStage.currentStage !== 'checkin' && checkinStage.stageStatus !== 'STARTED')) {
      return (
        <Alert
          message="Giai đoạn checkin chưa bắt đầu"
          description="Vui lòng đợi giai đoạn checkin được bắt đầu trước khi quét mã QR."
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }

    if (checkinStage.currentStage === 'checkin' && checkinStage.stageStatus === 'COMPLETED') {
      return (
        <Alert
          message="Giai đoạn checkin đã kết thúc"
          description="Giai đoạn checkin đã kết thúc. Không thể thực hiện checkin nữa."
          type="info"
          icon={<ExclamationCircleOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }

    return null;
  };

  return (
      <Card
        style={{
          borderRadius: "16px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          border: "none",
          background: "#fff",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        {/* Hiển thị thông báo trạng thái */}
        {getStageMessage()}

        <div
          className="qr-dark-frame"
          style={{
            opacity: canCheckin ? 1 : 0.5,
            pointerEvents: canCheckin ? 'auto' : 'none',
            width: "100%",
            marginTop: getStageMessage() ? "16px" : "0",
          }}
        >
          {/* Nút quay lại */}
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/organizing-committee")}
            className="qr-back-btn"
          >
            Quay lại
          </Button>

          {/* CAMERA FULL AREA */}
          <div id="qr-reader-element" className="qr-camera-full" />

          {/* Text dưới */}
          <div className="qr-text-inline">
            <h4>
              <QrcodeOutlined className="qr-icon-text" />
              Đưa mã QR vào giữa khung hình
            </h4>
            <p>Hệ thống sẽ tự động quét và xác thực</p>
          </div>
        </div>

        {/* ✅ Modal xác nhận đại biểu */}
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
              disabled={!canCheckin}
              style={{
                backgroundColor: canCheckin ? '#52c41a' : '#d9d9d9',
                borderColor: canCheckin ? '#52c41a' : '#d9d9d9',
              }}
              onMouseEnter={(e) => {
                if (canCheckin) {
                  e.currentTarget.style.backgroundColor = '#73d13d';
                  e.currentTarget.style.borderColor = '#73d13d';
                }
              }}
              onMouseLeave={(e) => {
                if (canCheckin) {
                  e.currentTarget.style.backgroundColor = '#52c41a';
                  e.currentTarget.style.borderColor = '#52c41a';
                }
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
      </Card>
      );
};

      export default QRScannerPanel;
