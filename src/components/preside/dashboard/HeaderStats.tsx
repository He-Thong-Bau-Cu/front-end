import { Card, Button, Typography, Avatar, message } from "antd";
import { FileTextOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import CreateDecisionModal from "@/components/preside/management-decision/CreateDecisionModal"; // 📂 import component modal mới
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import DecisionService from "@/services/DecisionService";
import { User } from "@/types/User.interface";
import { getUserLogin } from "@/utils/auth";
import ElectionParticipantsService from "@/services/ElectionParticipantsService";
const { Text } = Typography;

const HeaderStats = () => {
  const [open, setOpen] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserLogin();
        setUser(userData as User);
      } catch (error) {
        message.error("Không thể tải thông tin người dùng!");
      }
    };
    fetchUser();
  }, []);



  const handleCreateDecision = async (values: any, isEdit?: boolean, id?: string) => {
    try {
      showLoading();
      const apiData: any = {
        decisionNumber: values.decisionNumber,
        decisionName: values.decisionName,
        title: values.decisionName,
      };
      const apiData2: any = {
        decisionNumber: values.decisionNumber,
        decisionName: values.decisionName,
        title: values.decisionName,
        statusData: "WAIT_ENTER_DATA",
      };

      let response;
      let secretary;
      if (isEdit && id) {
        response = await DecisionService.updateDecision(id, apiData);
        if (response.status === 200 && response.success) {
          notify(response.message, "success");
          message.success("Cập nhật nghị quyết thành công!");
        } else {
          notify(response.message, "error");
          message.error("Không thể cập nhật nghị quyết. Vui lòng thử lại.");
        }
      } else {
        response = await DecisionService.createDecision(apiData2);
        const apiData3: any = {
          electionId: response.data?._id,
          userId: values.secretaryId,
          roleId: "6904d5f7105b6a336b819be5",
          position: "Thư ký chủ tọa",
          status: "ACTIVE"

        };
        secretary = await ElectionParticipantsService.createParticipant(apiData3);

        if (response.status === 201 && response.success) {
          notify(response.message, "success");
          message.success("Tạo nghị quyết thành công!");
        } else {
          notify(response.message, "error");
          message.error("Không thể tạo nghị quyết. Vui lòng thử lại.");
        }
      }

      setOpen(false);
    } catch (error: any) {
      console.error(`Error ${isEdit ? "updating" : "creating"} decision:`, error);
      message.error(
        error.response?.data?.message ||
        `Không thể ${isEdit ? "cập nhật" : "tạo"} nghị quyết. Vui lòng thử lại.`
      );
    } finally {
      hideLoading();
    }
  };


  return (

    <Card className="dashboard-preside-header-card">
      <div className="dashboard-preside-header-content">
        <div className="dashboard-preside-header-left">
          <Text strong className="dashboard-preside-header-title">Chủ tọa</Text>
          <p className="dashboard-preside-header-subtitle">
            Quản lý và giám sát toàn bộ quy trình bầu cử
          </p>
          <div className="dashboard-preside-header-user">
            <Avatar size={64} src={user?.imageKey || undefined} icon={<UserOutlined />} className="dashboard-preside-avatar" />
            <div className="dashboard-preside-user-info">
              <Text strong className="dashboard-preside-user-name">{user?.fullName}</Text>
            </div>
          </div>
        </div>

        <div className="dashboard-preside-header-actions">
          <Button
            icon={<FileTextOutlined />}
            className="btn-create-decision"
            type="primary"
            onClick={() => setOpen(true)} // 👈 khi click sẽ mở modal
          >
            Tạo quyết định
          </Button>
        </div>
      </div>

      {/* 🧩 Modal nhập thông tin nghị quyết */}
      <CreateDecisionModal
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        onSubmit={handleCreateDecision}
      />
    </Card>
  );
};

export default HeaderStats;
