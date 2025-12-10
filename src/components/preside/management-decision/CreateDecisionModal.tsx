import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  Divider,
  Select,
  DatePicker,
  Tag,
  Space,
} from "antd";
import { FileTextOutlined, PlusOutlined } from "@ant-design/icons";
import "../../../style/preside/CreateDecisionModal.model.css";
import { useNotification } from "@/contexts/NotificationContext";
import dayjs from "dayjs";
import UserService from "@/services/UserService";
import ElectionService from "@/services/ElectionService";
const { Option } = Select;
interface CreateDecisionModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any, isEdit?: boolean, id?: string) => void;
  editMode?: boolean;
  initialData?: any;
  secrytary?: any;
}
const FORMAT = "YYYY-MM-DD HH:mm:ss"; // FORMAT CHUẨN KHÔNG LỆCH GIỜ
const CreateDecisionModal: React.FC<CreateDecisionModalProps> = ({
  open,
  onCancel,
  onSubmit,
  editMode,
  initialData,
  secrytary
}) => {
  const [form] = Form.useForm();
  const [userList, setUserList] = useState<any[]>([]);
  const [boardControlList, setBoardControlList] = useState<any[]>([]);
  const { notify } = useNotification();
  const [showAddSecretary, setShowAddSecretary] = useState(false);
  const [addSecretaryModalOpen, setAddSecretaryModalOpen] = useState(false);
  const [secretaryForm] = Form.useForm();

  // Watch giá trị secretaryId và boardOfControlId để lọc danh sách
  const secretaryId = Form.useWatch('secretaryId', form);
  const boardOfControlId = Form.useWatch('boardOfControlId', form);
  // Giờ hành chính
  const WORK_START = 8;   // 08:00
  const WORK_END = 17;    // 17:00

  // Disable time ngoài giờ hành chính
  const disabledTime = () => {
    return {
      disabledHours: () => {
        const hours: number[] = [];
        for (let h = 0; h < 24; h++) {
          if (h < WORK_START || h >= WORK_END) hours.push(h);
        }
        return hours;
      },
      disabledMinutes: () => [],
      disabledSeconds: () => [],
    };
  };

  /* ===========================================================
      LOAD USER (KHÔNG CẦN THỜI GIAN)
  =========================================================== */
  const loadUsers = async () => {
    try {
      const res = await ElectionService.getElectionUser();
      setUserList(res || []);
      // Lọc danh sách ban kiểm soát (có thể cần API riêng hoặc filter theo role)
      // Tạm thời dùng chung userList, có thể cần API riêng sau
      setBoardControlList(res || []);
    } catch (err: any) {
      notify(err.response?.data?.message, "error");
    }
  };

  /* ===========================================================
      INIT FORM WHEN OPEN / EDIT
  =========================================================== */
  useEffect(() => {
    if (open) {
      // Load users ngay khi mở form
      loadUsers();

      if (editMode && initialData) {
        // Convert từ string backend -> dayjs đúng format
        const start = initialData.startDate
          ? dayjs(initialData.startDate, FORMAT)
          : null;
        const end = initialData.endDate
          ? dayjs(initialData.endDate, FORMAT)
          : null;

        // Xử lý tempSecretaryInfo nếu có
        let tempSecretaryUser: any = null;
        if (initialData.tempSecretaryInfo) {
          tempSecretaryUser = {
            _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            fullName: initialData.tempSecretaryInfo.fullName,
            email: initialData.tempSecretaryInfo.email,
            phone: initialData.tempSecretaryInfo.phone,
            citizenId: initialData.tempSecretaryInfo.citizenId,
            address: initialData.tempSecretaryInfo.address,
            isTemp: true,
          };
          // Thêm vào userList nếu chưa có
          setUserList((prevList) => {
            const exists = prevList.some(u =>
              u.isTemp &&
              u.email === tempSecretaryUser.email
            );
            if (!exists) {
              return [...prevList, tempSecretaryUser];
            }
            return prevList;
          });
        }

        // Convert _id sang string nếu cần
        // Ưu tiên lấy từ participant (nếu có), sau đó từ election.secretaryId, cuối cùng là tempSecretaryUser
        let secretaryIdValue = undefined;
        if (secrytary?.userId?._id) {
          secretaryIdValue = secrytary.userId._id.toString ? secrytary.userId._id.toString() : String(secrytary.userId._id);
        } else if (initialData.secretaryId) {
          secretaryIdValue = initialData.secretaryId.toString ? initialData.secretaryId.toString() : String(initialData.secretaryId);
        } else if (tempSecretaryUser) {
          secretaryIdValue = tempSecretaryUser._id;
        }

        const boardOfControlIdValue = initialData.boardOfControlId
          ? (initialData.boardOfControlId.toString ? initialData.boardOfControlId.toString() : String(initialData.boardOfControlId))
          : undefined;

        form.setFieldsValue({
          decisionNumber: initialData.decisionNumber || "",
          decisionName: initialData.decisionName || "",
          secretaryId: secretaryIdValue,
          boardOfControlId: boardOfControlIdValue,
          statusData: initialData.statusData || "DRAFT",
          startDate: start,
          endDate: end,
          newSecretaryInfo: initialData.tempSecretaryInfo || undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, editMode, initialData, form]);

  /* ===========================================================
      SUBMIT
  =========================================================== */
  const handleFinish = async (values: any) => {
      // Nếu có thông tin thư ký mới (từ form thêm thư ký)
      const newSecretaryInfo = form.getFieldValue("newSecretaryInfo");

      // Validation: Nếu trạng thái là WAIT_ENTER_DATA thì phải có thư ký và ban kiểm soát
      if (values.statusData === "WAIT_ENTER_DATA") {
        if (!values.secretaryId && !newSecretaryInfo) {
          notify("Vui lòng chọn thư ký hoặc thêm thư ký mới khi trạng thái là 'Gửi thư ký nhập dữ liệu'", "error");
          return;
        }
        if (!values.boardOfControlId) {
          notify("Vui lòng chọn ban kiểm soát khi trạng thái là 'Gửi thư ký nhập dữ liệu'", "error");
          return;
        }
      }

      // Nếu chọn trạng thái "Gửi thư ký nhập dữ liệu" → cảnh báo trước
      if (values.statusData === "WAIT_ENTER_DATA") {
        // Kiểm tra nếu secretaryId là tạm thời (bắt đầu bằng "temp_")
        const isTempSecretary = values.secretaryId && String(values.secretaryId).startsWith("temp_");

        // Nếu có thông tin thư ký mới hoặc secretaryId là tạm thời, tạo user và gửi mail
        if (newSecretaryInfo || isTempSecretary) {
          try {
            // Lấy thông tin từ newSecretaryInfo hoặc từ user tạm trong list
            let secretaryData = newSecretaryInfo;
            if (!secretaryData && isTempSecretary) {
              const tempUser = userList.find(u => String(u._id) === String(values.secretaryId));
              if (tempUser && tempUser.isTemp) {
                secretaryData = {
                  fullName: tempUser.fullName,
                  email: tempUser.email,
                  phone: tempUser.phone,
                  citizenId: tempUser.citizenId,
                  address: tempUser.address,
                };
              }
            }

            if (secretaryData) {
              // Tạo user cho thư ký mới với role mặc định là USER
              const userResponse = await UserService.create({
                fullName: secretaryData.fullName,
                email: secretaryData.email,
                phone: secretaryData.phone,
                citizenId: secretaryData.citizenId,
                address: secretaryData.address,
                roleId: null, // Không truyền roleId để backend tự động dùng USER_ROLE.USER
                position: "Thư ký chủ tọa",
                department: "Ban tổ chức",
                status: "ACTIVE",
              });

              // Lấy user mới tạo
              const newUser = userResponse?.data || userResponse;
              if (newUser?._id) {
                // Thay thế user tạm thời bằng user thật trong list
                if (isTempSecretary) {
                  setUserList((prevList) =>
                    prevList.map(u =>
                      String(u._id) === String(values.secretaryId) ? newUser : u
                    )
                  );
                } else {
                  // Thêm user mới vào danh sách
                  setUserList((prevList) => [...prevList, newUser]);
                }

                // Set secretaryId từ user mới tạo
                values.secretaryId = newUser._id;

                // Cập nhật form để hiển thị thư ký mới đã được chọn
                form.setFieldsValue({
                  secretaryId: newUser._id,
                  newSecretaryInfo: undefined, // Clear thông tin tạm
                });
              }
            }
          } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Không thể tạo thư ký mới";
            notify(errorMessage, "error");
            return;
          }
        }

      Modal.confirm({
        title: "Xác nhận tạo quyết định",
        content:
          "Nếu bạn tạo với trạng thái 'Gửi thư ký nhập dữ liệu' thì SAU KHI TẠO bạn sẽ không được phép chỉnh sửa lại nội dung bầu cử. Bạn có chắc chắn muốn tiếp tục không?",
        okText: "Tiếp tục",
        cancelText: "Hủy",
        onOk: () => {
          const payload = {
            ...values,
            startDate: values.startDate?.format(FORMAT),
            endDate: values.endDate?.format(FORMAT),
            tempSecretaryInfo: undefined, // Không cần lưu tạm nữa vì đã tạo user
          };
          onSubmit(payload, editMode, initialData?._id);
        }
      });
      return;
    }

    // Trường hợp trạng thái DRAFT → lưu tạm thông tin thư ký
    // Nếu có secretaryId (user đã có) thì gửi secretaryId
    // Nếu có newSecretaryInfo (thư ký mới) thì gửi tempSecretaryInfo
    // Nếu secretaryId là temp → lấy thông tin từ userList và gửi tempSecretaryInfo
    let tempSecretaryData = newSecretaryInfo;
    let secretaryIdToSend = values.secretaryId && !String(values.secretaryId).startsWith("temp_")
      ? values.secretaryId
      : undefined;

    if (!tempSecretaryData && values.secretaryId && String(values.secretaryId).startsWith("temp_")) {
      const tempUser = userList.find(u => String(u._id) === String(values.secretaryId));
      if (tempUser && tempUser.isTemp) {
        tempSecretaryData = {
          fullName: tempUser.fullName,
          email: tempUser.email,
          phone: tempUser.phone,
          citizenId: tempUser.citizenId,
          address: tempUser.address,
        };
      }
    }

    const payload = {
      ...values,
      startDate: values.startDate?.format(FORMAT),
      endDate: values.endDate?.format(FORMAT),
      secretaryId: secretaryIdToSend,
      tempSecretaryInfo: tempSecretaryData,
    };

    onSubmit(payload, editMode, initialData?._id);
  };

  /* ===========================================================
      HANDLE ADD SECRETARY
  =========================================================== */
  const handleAddSecretary = () => {
    setAddSecretaryModalOpen(true);
  };

  const handleSecretaryFormSubmit = (values: any) => {
    // Tạo một object tạm thời với _id tạm để thêm vào danh sách
    const tempSecretaryUser = {
      _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      citizenId: values.citizenId,
      address: values.address,
      isTemp: true, // Đánh dấu là user tạm thời
    };

    // Thêm vào danh sách thư ký
    setUserList((prevList) => [...prevList, tempSecretaryUser]);

    // Set secretaryId và lưu thông tin thư ký mới vào form
    form.setFieldsValue({
      secretaryId: tempSecretaryUser._id,
      newSecretaryInfo: values,
    });

    setAddSecretaryModalOpen(false);
    secretaryForm.resetFields();
    notify("Đã thêm thư ký mới vào danh sách", "success");
  };


  /* ===========================================================
      MIN DATE = TODAY + 20 DAYS
  =========================================================== */
  const todayPlus20 = dayjs().add(21, "day").startOf("day");

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={750}
      className="create-decision-modal"
      centered
    >
      {/* HEADER */}
      <div className="modal-header">
        <FileTextOutlined className="header-icon" />
        <div>
          <h2 className="header-title">
            {editMode ? "Chỉnh sửa quyết định bầu cử" : "Tạo quyết định bầu cử"}
          </h2>
          <p className="header-sub">
            {editMode
              ? "Cập nhật thông quyết định bầu cử"
              : "Nhập đầy đủ thông tin cần thiết"}
          </p>
        </div>
      </div>

      <Divider />

      {/* FORM */}
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Row gutter={[0, 16]}>
          {/* Số quyết định */}
          <Col span={24}>
            <Form.Item
              name="decisionNumber"
              label="Số quyết định"
              rules={[{ required: true, message: "Vui lòng nhập số quyết định" }]}
            >
              <Input placeholder="VD: QĐ-15/2025/QH-16" />
            </Form.Item>
          </Col>

          {/* Tên nghị quyết */}
          <Col span={24}>
            <Form.Item
              name="decisionName"
              label="Tên quyết định"
              rules={[{ required: true, message: "Vui lòng nhập tên quyết định" }]}
            >
              <Input placeholder="Nhập tên quyết định" />
            </Form.Item>
          </Col>

          {/* DATE RANGE */}
          <Row gutter={20} style={{ width: "100%" }}>
            {/* Thời gian bắt đầu */}
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Thời gian bắt đầu"
                rules={[{ required: true, message: "Vui lòng chọn thời gian bắt đầu" }]}
              >
                <DatePicker
                  showTime={{
                    format: "HH:mm",
                    disabledTime,   // ⬅ CHỈ ĐƯỢC CHỌN TRONG GIỜ HÀNH CHÍNH
                  }}
                  format={FORMAT}
                  style={{ width: "100%" }}
                  placeholder="Chọn thời gian bắt đầu"
                  disabledDate={(current) => current && current < todayPlus20}
                  onChange={(value) => {
                    form.setFieldsValue({ startDate: value });
                  }}
                />

              </Form.Item>
            </Col>

            {/* Thời gian kết thúc */}
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Thời gian kết thúc"
                dependencies={["startDate"]}
                rules={[
                  { required: true, message: "Vui lòng chọn thời gian kết thúc" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const start = getFieldValue("startDate");
                      if (!value || !start) return Promise.resolve();

                      // Cho phép cùng ngày nhưng giờ phải sau
                      if (value.isBefore(start)) {
                        return Promise.reject(
                          "Thời gian kết thúc phải sau thời gian bắt đầu"
                        );
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker
                  showTime={{
                    format: "HH:mm",
                    disabledTime,   // ⬅ CHỈ ĐƯỢC CHỌN TRONG GIỜ HÀNH CHÍNH
                  }}
                  format={FORMAT}
                  style={{ width: "100%" }}
                  placeholder="Chọn thời gian kết thúc"
                  disabledDate={(current) => {
                    const start = form.getFieldValue("startDate");

                    if (!start) return current && current < todayPlus20;

                    return current && current < start.startOf("day");
                  }}
                  onChange={(value) => {
                    form.setFieldsValue({ endDate: value });
                  }}
                />

              </Form.Item>
            </Col>
          </Row>

          {/* Thư ký */}
          <Col span={24}>
            <Form.Item
              name="secretaryId"
              label="Thư ký chủ tọa"
              rules={[
                { required: true, message: "Vui lòng chọn thư ký hoặc thêm thư ký mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const newSecretaryInfo = getFieldValue("newSecretaryInfo");
                    if (!value && !newSecretaryInfo) {
                      return Promise.reject(new Error("Vui lòng chọn thư ký hoặc thêm thư ký mới"));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Select
                placeholder="Chọn thư ký"
                allowClear
                disabled={(() => {
                  const secretaryId = form.getFieldValue("secretaryId");
                  const newSecretaryInfo = form.getFieldValue("newSecretaryInfo");
                  const tempSecretaryInfo = initialData?.tempSecretaryInfo;
                  // Disable nếu có tempSecretaryInfo hoặc newSecretaryInfo nhưng không có secretaryId
                  return (!secretaryId || secretaryId === null || secretaryId === undefined) && (newSecretaryInfo || tempSecretaryInfo);
                })()}
                dropdownRender={(menu) => (
                  <React.Fragment>
                    {menu}
                    <>
                      <Divider style={{ margin: '8px 0' }} />
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={handleAddSecretary}
                        style={{ width: '100%' }}
                      >
                        Thêm thư ký mới
                      </Button>
                    </>
                  </React.Fragment>
                )}
              >
                {/* Option hiện tại (dùng khi EDIT) */}
                {editMode && secrytary?.userId && (
                  <Option value={secrytary.userId._id}>
                    {secrytary.userId.fullName} - {secrytary.userId.email}
                  </Option>
                )}

                {/* Danh sách userList - lọc bỏ user đã được chọn làm ban kiểm soát */}
                {userList
                  .filter((user) => !boardOfControlId || String(user._id) !== String(boardOfControlId))
                  .map((user) => (
                    <Option key={user._id} value={user._id}>
                      {user.fullName} - {user.email}
                      {user.isTemp && <span style={{ color: '#999', marginLeft: 8 }}>(Mới thêm)</span>}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            {/* Hiển thị thông tin thư ký mới nếu đã thêm */}
            {(() => {
              const secretaryId = form.getFieldValue("secretaryId");
              const newSecretaryInfo = form.getFieldValue("newSecretaryInfo");
              const tempSecretaryInfo = initialData?.tempSecretaryInfo;

              // Nếu secretaryId == null và có tempSecretaryInfo hoặc newSecretaryInfo thì hiển thị
              if ((!secretaryId || secretaryId === null || secretaryId === undefined) && (newSecretaryInfo || tempSecretaryInfo)) {
                const info = newSecretaryInfo || tempSecretaryInfo;
                return (
                  <Tag color="green" style={{ marginTop: 8 }}>
                    Thư ký mới thêm: {info?.fullName} - {info?.email}
                    {!editMode && (
                      <Button
                        type="link"
                        danger
                        size="small"
                        onClick={() => {
                          form.setFieldsValue({ newSecretaryInfo: undefined, secretaryId: undefined });
                        }}
                        style={{ marginLeft: 8 }}
                      >
                        Xóa
                      </Button>
                    )}
                  </Tag>
                );
              }
              return null;
            })()}
          </Col>

          {/* Ban kiểm soát */}
          <Col span={24}>
            <Form.Item
              name="boardOfControlId"
              label="Ban kiểm soát"
              rules={[{ required: true, message: "Vui lòng chọn ban kiểm soát" }]}
            >
              <Select
                placeholder="Chọn ban kiểm soát"
                allowClear
                showSearch
                filterOption={(input, option) => {
                  const label = option?.label || option?.children;
                  if (typeof label === 'string') {
                    return label.toLowerCase().includes(input.toLowerCase());
                  }
                  if (Array.isArray(label)) {
                    return label.some((item: any) =>
                      String(item?.props?.children || item).toLowerCase().includes(input.toLowerCase())
                    );
                  }
                  return false;
                }}
              >
                {/* Danh sách boardControlList - lọc bỏ user đã được chọn làm thư ký */}
                {boardControlList
                  .filter((user) => !secretaryId || String(user._id) !== String(secretaryId))
                  .map((user) => (
                    <Option key={user._id} value={user._id}>
                      {user.fullName} - {user.email}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Trạng thái */}
          <Col span={24}>
            <Form.Item
              name="statusData"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              initialValue="DRAFT"
            >
              <Select placeholder="Chọn trạng thái" disabled={editMode && initialData?.statusData !== "DRAFT"}>
                <Option value="DRAFT">Lưu nháp</Option>
                <Option value="WAIT_ENTER_DATA">Gửi thư ký nhập dữ liệu</Option>
              </Select>
            </Form.Item>
          </Col>

        </Row>

        {/* FOOTER */}
        <div className="modal-footer">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit" >
            {editMode ? "Cập nhật quyết định" : "Tạo quyết định"}
          </Button>
        </div>
      </Form>

      {/* Modal thêm thư ký mới */}
      <Modal
        title="Thêm thư ký mới"
        open={addSecretaryModalOpen}
        onCancel={() => {
          setAddSecretaryModalOpen(false);
          secretaryForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={secretaryForm}
          layout="vertical"
          onFinish={handleSecretaryFormSubmit}
          validateTrigger={['onChange', 'onBlur']}
        >
          <Form.Item
            label="Họ và tên *"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Nhập họ tên đầy đủ" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="CCCD/CMND *"
                name="citizenId"
                rules={[
                  { required: true, message: "Vui lòng nhập số CCCD" },
                  {
                    validator: (_, value) => {
                      if (!value) {
                        return Promise.resolve();
                      }
                      // Kiểm tra phải có đúng 12 chữ số
                      if (!/^\d{12}$/.test(value)) {
                        return Promise.reject(new Error("Số CCCD/CMND phải có đúng 12 chữ số"));
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Số CCCD (12 chữ số)" maxLength={12} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Số điện thoại *"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    validator: async (_, value) => {
                      if (!value) {
                        return Promise.resolve();
                      }
                      try {
                        const response = await UserService.checkExists(undefined, value, undefined);
                        if (response?.data?.exists && response.data.field === 'phone') {
                          return Promise.reject(new Error(response.data.message || 'Số điện thoại đã tồn tại trong hệ thống !'));
                        }
                        return Promise.resolve();
                      } catch (error: any) {
                        // Nếu có lỗi từ API, vẫn cho phép (có thể do network)
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
              >
                <Input placeholder="Số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email *"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                  {
                    validator: async (_, value) => {
                      if (!value) {
                        return Promise.resolve();
                      }
                      try {
                        const response = await UserService.checkExists(value, undefined, undefined);
                        if (response?.data?.exists && response.data.field === 'email') {
                          return Promise.reject(new Error(response.data.message || 'Email đã tồn tại trong hệ thống !'));
                        }
                        return Promise.resolve();
                      } catch (error: any) {
                        // Nếu có lỗi từ API, vẫn cho phép (có thể do network)
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Địa chỉ *"
                name="address"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
              >
                <Input placeholder="Địa chỉ" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 20 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={() => {
                setAddSecretaryModalOpen(false);
                secretaryForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Thêm thư ký
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

export default CreateDecisionModal;
