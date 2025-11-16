import React, { useEffect, useState, useRef } from "react";
import { Card, message, Button, Modal, Descriptions, Spin } from "antd";
import { ArrowLeftOutlined, QrcodeOutlined } from "@ant-design/icons";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import DelegateCardService from "@/services/DelegateCardService";
import MeetingAttendeeService from "@/services/MeetingAttendeeService";
import ElectionParticipantService from "@/services/ElectionParticipantsService";
import { BaseResponse } from "@/types/BaseResponse.interface";

const QRScannerPanel: React.FC = () => {
  const navigate = useNavigate();

  // 👉 State quản lý modal và dữ liệu đại biểu
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [delegateData, setDelegateData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const isProcessingRef = useRef(false); // Flag để ngăn quét lại khi đang xử lý (dùng ref vì callback không cập nhật state)

  useEffect(() => {
    const elementId = "qr-reader-element";
    const scanner = new Html5Qrcode(elementId, false); // verbose = false để tránh spam console với NotFoundException
    
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
      // Bỏ qua cảnh báo "NotFoundException" từ html5-qrcode
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
          // Lấy 80% chiều rộng nhỏ hơn, tối đa 350px, tối thiểu 200px (giảm để dễ quét hơn)
          const size = Math.min(Math.max(Math.min(viewportWidth, viewportHeight) * 0.8, 200), 350);
          console.log("📐 QR Box size:", size);
          return { width: size, height: size };
        };

        await scanner.start(
          { 
            facingMode: "environment",
          },
          { 
            fps: 15, // FPS tối ưu cho QR scanning: cân bằng giữa tốc độ và chất lượng
            qrbox: getQRBoxSize(),
            aspectRatio: 1.0,
            disableFlip: false,
            videoConstraints: {
              facingMode: "environment",
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          },
          async (decodedText: string) => {
            // decodedText là token từ QR code
            console.log("✅ QR Code detected! Raw token:", decodedText);
            
            // Ngăn quét lại nếu đang xử lý
            if (isProcessingRef.current) {
              console.log("⏸️ Đang xử lý request trước đó, bỏ qua...");
              return;
            }

            isProcessingRef.current = true;
            
            // Làm sạch token: trim khoảng trắng và ký tự đặc biệt
            const cleanedToken = decodedText.trim();
            
            try {
              setLoading(true);
              
              console.log("📡 Step 1: Calling getByToken with cleaned token:", cleanedToken);
              
              // Bước 1: Lấy thông tin thẻ đại biểu từ token
              const tokenResponse: BaseResponse<any> = await DelegateCardService.getByToken(cleanedToken);
              console.log("📥 Step 1 Response:", tokenResponse);
              
              // Kiểm tra response và data
              if (!tokenResponse || !tokenResponse.success) {
                const errorMsg = tokenResponse?.message || "Không tìm thấy thông tin thẻ đại biểu";
                console.error("❌ API Response Error:", errorMsg);
                message.error(`❌ ${errorMsg}`);
                setLoading(false);
                isProcessingRef.current = false;
                return;
              }
              
              if (!tokenResponse.data) {
                console.error("❌ API Response data is null");
                message.error("❌ Không tìm thấy thông tin thẻ đại biểu. Token có thể không hợp lệ hoặc đã hết hạn.");
                setLoading(false);
                isProcessingRef.current = false;
                return;
              }

              // Lấy thông tin đại biểu từ response
              const delegateCard = tokenResponse.data;
              
              // Lấy thông tin voter từ delegateCard
              const voter = delegateCard.voterId;
              if (!voter || !voter.userId) {
                message.error("Không tìm thấy thông tin cử tri");
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
              message.success("✅ Đã quét mã thành công");

              // Tự động cập nhật trạng thái tham gia (attended = true)
              try {
                const meetingId = localStorage.getItem("currentMeetingId");
                if (!meetingId) {
                  console.warn("⚠️ Không tìm thấy meetingId trong localStorage");
                  message.warning("Vui lòng chọn cuộc họp trước khi check-in");
                  return;
                }

                if (electionId && userId._id) {
                  // Tìm ElectionParticipant đã tồn tại trong cuộc bầu cử (không tạo mới)
                  const participants = await ElectionParticipantService.getByUserId(userId._id);
                  const participant = Array.isArray(participants) 
                    ? participants.find((p: any) => p.electionId?._id === electionId || p.electionId === electionId)
                    : null;
                  
                  if (participant && participant._id) {
                    try {
                      // Thử cập nhật trạng thái tham gia cuộc họp (nếu MeetingAttendee record đã tồn tại)
                      await MeetingAttendeeService.updateStatusAttendance(
                        meetingId,
                        participant._id,
                        true
                      );
                      console.log("✅ Đã cập nhật trạng thái tham gia cuộc họp thành công");
                    } catch (updateError: any) {
                      // Nếu MeetingAttendee record chưa tồn tại, tạo mới record ghi nhận tham gia cuộc họp
                      if (updateError?.response?.status === 404 || updateError?.response?.status === 500) {
                        console.log("📝 Tạo mới MeetingAttendee record (ghi nhận tham gia cuộc họp)...");
                        await MeetingAttendeeService.create({
                          meetingId: meetingId,
                          participantId: participant._id, // Sử dụng participant đã tồn tại
                          checkInTime: new Date(),
                          attended: true,
                        });
                        console.log("✅ Đã tạo mới MeetingAttendee record và cập nhật trạng thái tham gia thành công");
                      } else {
                        throw updateError;
                      }
                    }
                  } else {
                    console.warn("⚠️ Không tìm thấy ElectionParticipant cho userId và electionId này");
                    message.warning("Người này chưa được thêm vào danh sách tham gia cuộc bầu cử");
                  }
                } else {
                  console.warn("⚠️ Thiếu electionId hoặc userId để cập nhật trạng thái tham gia");
                }
              } catch (attendanceError: any) {
                console.error("❌ Lỗi khi cập nhật trạng thái tham gia:", attendanceError);
                const errorMsg = attendanceError?.response?.data?.message || attendanceError?.message || "Không thể cập nhật trạng thái tham gia";
                message.error(`❌ ${errorMsg}`);
              }
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
              message.error(`❌ ${errorMessage}`);
              // Không dừng camera nếu lỗi, để có thể quét lại
            } finally {
              setLoading(false);
              isProcessingRef.current = false; // Cho phép quét lại
            }
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
              message.error("❌ Quyền camera bị chặn. Hãy cấp lại quyền trong trình duyệt.");
            } else if (errorMessage.includes("NotFoundError")) {
              message.error("❌ Không tìm thấy camera. Vui lòng kiểm tra thiết bị.");
            }
          }
        );
        
        console.log("✅ Camera đã khởi động thành công!");
      } catch (err: any) {
        console.error("❌ Không thể bật camera:", err);
        console.error("❌ Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack,
        });
        
        if (err.name === "NotAllowedError" || err.message?.includes("NotAllowedError")) {
          message.error("❌ Bạn chưa cấp quyền truy cập camera. Vui lòng cấp quyền và tải lại trang.");
        } else if (err.name === "NotFoundError" || err.message?.includes("NotFoundError")) {
          message.error("❌ Không tìm thấy thiết bị camera nào. Vui lòng kiểm tra thiết bị.");
        } else if (err.name === "OverconstrainedError" || err.message?.includes("OverconstrainedError")) {
          message.error("❌ Camera không hỗ trợ cấu hình yêu cầu. Đang thử cấu hình khác...");
          // Có thể thử lại với cấu hình đơn giản hơn
        } else {
          message.error(`❌ Không thể bật camera: ${err.message || "Lỗi không xác định"}`);
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
      // Khôi phục lại console.error và console.warn ban đầu
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);

  // 👉 Khi nhấn “Lưu” trong modal
  const handleSave = () => {
    message.success(`✅ Đã xác thực đại biểu: ${delegateData?.fullName}`);
    setIsModalVisible(false);
    // Quay lại màn tổng quan
    navigate("/organizing-committee");
  };

  // 👉 Khi nhấn "Hủy"
  const handleCancel = async () => {
    setIsModalVisible(false);
    setDelegateData(null);
    message.info("❎ Đã hủy xác nhận.");
    
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
          fps: 15, // FPS tối ưu cho QR scanning
          qrbox: getQRBoxSize(),
          aspectRatio: 1.0,
          disableFlip: false,
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        async (decodedText: string) => {
          console.log("🔍 Token từ QR code (retry):", decodedText);
          // Làm sạch token: trim khoảng trắng và ký tự đặc biệt
          const cleanedToken = decodedText.trim();
          
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
              message.error(`❌ ${errorMsg}`);
              setLoading(false);
              return;
            }
            
            if (!tokenResponse.data) {
              console.error("❌ API Response data is null (retry)");
              message.error("❌ Không tìm thấy thông tin thẻ đại biểu. Token có thể không hợp lệ hoặc đã hết hạn.");
              setLoading(false);
              return;
            }

            // Lấy thông tin đại biểu từ response
            const delegateCard = tokenResponse.data;
            
            const voter = delegateCard.voterId;
            if (!voter || !voter.userId) {
              message.error("Không tìm thấy thông tin cử tri");
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
            message.success("✅ Đã quét mã thành công");

            // Tự động cập nhật trạng thái tham gia (attended = true)
            try {
              const meetingId = localStorage.getItem("currentMeetingId");
              if (!meetingId) {
                console.warn("⚠️ Không tìm thấy meetingId trong localStorage (retry)");
                message.warning("Vui lòng chọn cuộc họp trước khi check-in");
                return;
              }

              if (electionId && userId._id) {
                // Tìm ElectionParticipant đã tồn tại trong cuộc bầu cử (không tạo mới)
                const participants = await ElectionParticipantService.getByUserId(userId._id);
                const participant = Array.isArray(participants) 
                  ? participants.find((p: any) => p.electionId?._id === electionId || p.electionId === electionId)
                  : null;
                
                if (participant && participant._id) {
                  try {
                    // Thử cập nhật trạng thái tham gia cuộc họp (nếu MeetingAttendee record đã tồn tại)
                    await MeetingAttendeeService.updateStatusAttendance(
                      meetingId,
                      participant._id,
                      true
                    );
                    console.log("✅ Đã cập nhật trạng thái tham gia cuộc họp thành công (retry)");
                  } catch (updateError: any) {
                    // Nếu MeetingAttendee record chưa tồn tại, tạo mới record ghi nhận tham gia cuộc họp
                    if (updateError?.response?.status === 404 || updateError?.response?.status === 500) {
                      console.log("📝 Tạo mới MeetingAttendee record (ghi nhận tham gia cuộc họp)... (retry)");
                      await MeetingAttendeeService.create({
                        meetingId: meetingId,
                        participantId: participant._id, // Sử dụng participant đã tồn tại
                        checkInTime: new Date(),
                        attended: true,
                      });
                      console.log("✅ Đã tạo mới MeetingAttendee record và cập nhật trạng thái tham gia thành công (retry)");
                    } else {
                      throw updateError;
                    }
                  }
                } else {
                  console.warn("⚠️ Không tìm thấy ElectionParticipant cho userId và electionId này (retry)");
                  message.warning("Người này chưa được thêm vào danh sách tham gia cuộc bầu cử");
                }
              } else {
                console.warn("⚠️ Thiếu electionId hoặc userId để cập nhật trạng thái tham gia (retry)");
              }
            } catch (attendanceError: any) {
              console.error("❌ Lỗi khi cập nhật trạng thái tham gia (retry):", attendanceError);
              const errorMsg = attendanceError?.response?.data?.message || attendanceError?.message || "Không thể cập nhật trạng thái tham gia";
              message.error(`❌ ${errorMsg}`);
            }
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
            message.error(`❌ ${errorMessage}`);
          } finally {
            setLoading(false);
          }
        },
        (error: unknown) => {
          // Bỏ qua lỗi "NotFoundException" vì đây là lỗi bình thường
          if (typeof error === "string") {
            if (error.includes("NotFoundException") || error.includes("No MultiFormat Readers")) {
              return; // Không log lỗi này
            }
            if (error.includes("NotAllowedError")) {
              message.error("❌ Quyền camera bị chặn. Hãy cấp lại quyền trong trình duyệt.");
            }
          }
        }
      );
    } catch (err) {
      console.warn("⚠️ Không thể bật lại camera:", err);
    }
  };

  return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div
          className="qr-dark-frame"
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
      </div>
      );
};

      export default QRScannerPanel;
