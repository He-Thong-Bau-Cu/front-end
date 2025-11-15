import React, { useEffect, useState, useRef } from "react";
import { Card, message, Button, Modal, Descriptions, Spin } from "antd";
import { ArrowLeftOutlined, QrcodeOutlined } from "@ant-design/icons";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import DelegateCardService from "@/services/DelegateCardService";
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
    const scanner = new Html5Qrcode(elementId, true); // verbose = true để debug

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
            fps: 10, // Giảm FPS để ổn định hơn (30 có thể quá cao)
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
            console.log("✅ QR Code detected! Token:", decodedText);
            
            // Ngăn quét lại nếu đang xử lý
            if (isProcessingRef.current) {
              console.log("⏸️ Đang xử lý request trước đó, bỏ qua...");
              return;
            }

            isProcessingRef.current = true;
            try {
              setLoading(true);
              
              // Bước 1: Lấy thông tin thẻ đại biểu từ token
              console.log("📡 Step 1: Calling getByToken with token:", decodedText);
              const tokenResponse: BaseResponse<any> = await DelegateCardService.getByToken(decodedText);
              console.log("📥 Step 1 Response:", tokenResponse);
              
              if (!tokenResponse || !tokenResponse.success || !tokenResponse.data) {
                message.error(tokenResponse?.message || "Không tìm thấy thông tin thẻ đại biểu");
                setLoading(false);
                return;
              }

              const delegateCard = tokenResponse.data;
              const delegateCardId = delegateCard._id;
              
              // Bước 2: Gọi generateDelegateCardQRCode với ID của delegate card
              console.log("📡 Step 2: Calling generateDelegateCardQRCode with ID:", delegateCardId);
              const qrCodeResponse: BaseResponse<any> = await DelegateCardService.generateQRCode(delegateCardId);
              console.log("📥 Step 2 Response:", qrCodeResponse);
              
              // Lấy thông tin voter từ delegateCard
              const voter = delegateCard.voterId;
              if (!voter) {
                message.error("Không tìm thấy thông tin cử tri");
                setLoading(false);
                return;
              }

              // Map dữ liệu để hiển thị trong modal
              const delegateInfo = {
                id: delegateCard._id,
                fullName: voter.fullName || "",
                code: voter.username || "",
                department: voter.department || "",
                position: voter.position || "",
                email: voter.email || "",
                phone: voter.phone || "",
                electionName: delegateCard.electionId?.title || "",
                qrCode: qrCodeResponse?.data || null, // QR code image data
              };

              setDelegateData(delegateInfo);
              setIsModalVisible(true);
              // Dừng camera sau khi đã lấy được thông tin
              await stopScanner();
              message.success("✅ Đã quét mã thành công");
            } catch (error: any) {
              console.error("❌ Lỗi khi lấy thông tin thẻ đại biểu:", error);
              console.error("❌ Error details:", {
                message: error?.message,
                response: error?.response,
                responseData: error?.response?.data,
                status: error?.response?.status,
              });
              
              // Hiển thị thông báo lỗi chi tiết hơn
              const errorMessage = error?.response?.data?.message 
                || error?.message 
                || "Không thể lấy thông tin thẻ đại biểu";
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
      const scanner = new Html5Qrcode(elementId);
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
          fps: 30,
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
          try {
            setLoading(true);
            
            // Bước 1: Lấy thông tin thẻ đại biểu từ token
            console.log("📡 Step 1 (retry): Calling getByToken with token:", decodedText);
            const tokenResponse: BaseResponse<any> = await DelegateCardService.getByToken(decodedText);
            console.log("📥 Step 1 Response (retry):", tokenResponse);
            
            if (!tokenResponse || !tokenResponse.success || !tokenResponse.data) {
              message.error(tokenResponse?.message || "Không tìm thấy thông tin thẻ đại biểu");
              setLoading(false);
              return;
            }

            const delegateCard = tokenResponse.data;
            const delegateCardId = delegateCard._id;
            
            // Bước 2: Gọi generateDelegateCardQRCode với ID của delegate card
            console.log("📡 Step 2 (retry): Calling generateDelegateCardQRCode with ID:", delegateCardId);
            const qrCodeResponse: BaseResponse<any> = await DelegateCardService.generateQRCode(delegateCardId);
            console.log("📥 Step 2 Response (retry):", qrCodeResponse);
            
            const voter = delegateCard.voterId;
            if (!voter) {
              message.error("Không tìm thấy thông tin cử tri");
              setLoading(false);
              return;
            }

            const delegateInfo = {
              id: delegateCard._id,
              fullName: voter.fullName || "",
              code: voter.username || "",
              department: voter.department || "",
              position: voter.position || "",
              email: voter.email || "",
              phone: voter.phone || "",
              electionName: delegateCard.electionId?.title || "",
              qrCode: qrCodeResponse?.data || null, // QR code image data
            };

            setDelegateData(delegateInfo);
            setIsModalVisible(true);
            await scanner.stop();
            await scanner.clear();
            message.success("✅ Đã quét mã thành công");
          } catch (error: any) {
            console.error("❌ Lỗi khi lấy thông tin thẻ đại biểu (retry):", error);
            console.error("❌ Error details (retry):", {
              message: error?.message,
              response: error?.response,
              responseData: error?.response?.data,
              status: error?.response?.status,
            });
            
            const errorMessage = error?.response?.data?.message 
              || error?.message 
              || "Không thể lấy thông tin thẻ đại biểu";
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
            <Button key="save" type="primary" onClick={handleSave}>
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
              {delegateData.qrCode && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <p style={{ marginBottom: 8 }}>Mã QR xác thực:</p>
                  <img 
                    src={delegateData.qrCode} 
                    alt="QR Code" 
                    style={{ 
                      maxWidth: "200px", 
                      maxHeight: "200px",
                      border: "1px solid #e5e7eb",
                      padding: "8px",
                      borderRadius: "8px",
                      background: "#fff"
                    }} 
                  />
                </div>
              )}
            </div>
          ) : (
            <p>Không có dữ liệu đại biểu.</p>
          )}
        </Modal>
      </div>
      );
};

      export default QRScannerPanel;
