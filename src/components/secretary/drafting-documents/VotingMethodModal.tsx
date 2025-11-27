import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  Upload,
  Tag,
  Radio,
} from "antd";
import { PlusOutlined, DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import { VotingMethods } from "@/types/VotingMethods.interface";
import { Typography } from "antd";
import { useNotification } from "@/contexts/NotificationContext";
import FileService from "@/services/FileService";
import { useLoading } from "@/contexts/LoadingContext";
import { downloadBlob } from "@/utils/file";

const { Text } = Typography;

interface Candidate {
  _id?: string; // ID từ backend (nếu có = edit, không có = mới)
  title: string;
  description: string;
  formType?: "person" | "project" | "other"; // Loại form: nhập người, nhập dự án, hoặc khác
  metaData: {
    fullName?: string;
    age?: string;
    department?: string;
    position?: string;
    experience?: string;
    achievements?: string;
    image?: string;
    // Dữ liệu cho dự án
    projectName?: string;
    projectDescription?: string;
    budget?: string;
    duration?: string;
    location?: string;
    objectives?: string;
    benefits?: string;
    type?: string;
  };
  file?: string;
  fileUrl?: string; // Lưu fileUrl vào electionEntities (giống AttachedDocuments)
}

interface VotingMethodModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (candidates: Candidate[]) => void;
  methods: VotingMethods[];
  selectedMethodId?: string;
  initialCandidates?: Candidate[];
}

const emptyCandidate: Candidate = {
  title: "",
  description: "",
  formType: "person", // Mặc định là nhập người
  metaData: {
    fullName: "",
    age: "",
    department: "",
    position: "",
    experience: "",
    achievements: "",
  },
  file: "",
};

const VotingMethodModal: React.FC<VotingMethodModalProps> = ({
  open,
  onCancel,
  onSubmit,
  methods,
  selectedMethodId,
  initialCandidates,
}) => {
  const [form] = Form.useForm();
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [formType, setFormType] = useState<"person" | "project" | "other">("person"); // State để lưu loại form được chọn
  const { notify } = useNotification();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (open) {
      if (selectedMethodId) {
        setSelectedMethod(selectedMethodId);

        // Load initial candidates if available
        if (initialCandidates && initialCandidates.length > 0) {
          const firstCandidate = initialCandidates[0];
          let firstFormType = firstCandidate?.formType || firstCandidate?.metaData?.type;

          if (!firstFormType) {
            if (firstCandidate?.metaData?.projectName || firstCandidate?.metaData?.projectDescription) {
              firstFormType = "project";
            }
            else if (firstCandidate?.metaData?.fullName) {
              firstFormType = "person";
            }
            else {
              firstFormType = "other";
            }
          }

          setFormType(firstFormType as "person" | "project" | "other");

          const candidatesWithFormType = initialCandidates.map((candidate) => {
            return {
              ...candidate,
              formType: candidate.formType || firstFormType,
              metaData: {
                ...candidate.metaData,
                type: candidate.metaData?.type || firstFormType,
                // Đảm bảo các trường cần thiết có giá trị
                fullName: candidate.metaData?.fullName || "",
                projectName: candidate.metaData?.projectName || "",
                projectDescription: candidate.metaData?.projectDescription || "",
              },
              fileUrl: candidate.fileUrl || "", // Giữ fileUrl từ backend
            };
          });
          form.setFieldsValue({ candidates: candidatesWithFormType });
        } else {
          setFormType("person"); // Reset về mặc định
          form.setFieldsValue({ candidates: [emptyCandidate, emptyCandidate] });
        }
      } else {
        setSelectedMethod("");
        setFormType("person");
        form.resetFields();
        form.setFieldsValue({ candidates: [] });
      }
    } else {
      // Reset when modal closes
      setFormType("person");
      form.resetFields();
    }
  }, [open, selectedMethodId, initialCandidates, form]);


  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedMethodId) {
        notify("Vui lòng chọn hình thức bầu cử trước", "warning");
        return;
      }

      const candidatesWithId = (values.candidates || []).map((candidate: any, index: number) => {
        const initialCandidate = initialCandidates?.[index];

        let fileUrl = "";
        if (candidate.fileUrl !== undefined && candidate.fileUrl !== null && candidate.fileUrl !== "") {
          fileUrl = candidate.fileUrl;
        } else if (candidate.fileUrl === "") {
          fileUrl = "";
        } else {
          fileUrl = initialCandidate?.fileUrl || "";
        }

        // Clear các trường không thuộc formType hiện tại
        let cleanedMetaData: any = {
          type: formType,
        };

        if (formType === "person") {
          // Chỉ giữ lại các trường của person
          cleanedMetaData = {
            type: formType,
            fullName: candidate.metaData?.fullName || "",
            age: candidate.metaData?.age || "",
            department: candidate.metaData?.department || "",
            position: candidate.metaData?.position || "",
            experience: candidate.metaData?.experience || "",
            achievements: candidate.metaData?.achievements || "",
          };
        } else if (formType === "project") {
          // Chỉ giữ lại các trường của project
          cleanedMetaData = {
            type: formType,
            projectName: candidate.metaData?.projectName || "",
            projectDescription: candidate.metaData?.projectDescription || "",
            budget: candidate.metaData?.budget || "",
            duration: candidate.metaData?.duration || "",
            location: candidate.metaData?.location || "",
            objectives: candidate.metaData?.objectives || "",
            benefits: candidate.metaData?.benefits || "",
          };
        } else {
          // Form "other" - không có trường metaData đặc biệt, chỉ có type
          cleanedMetaData = {
            type: formType,
          };
        }

        return {
          ...candidate,
          _id: initialCandidate?._id,
          formType: formType,
          metaData: cleanedMetaData,
          fileUrl: fileUrl,
        };
      });
      onSubmit(candidatesWithId);
      onCancel();
    } catch (error) {
      hideLoading();
      if (error) {
        return;
      }
    }
  };

  // Hàm xử lý khi chọn file - upload ngay lên server (giống AttachedDocuments - sử dụng upfile)
  const handleFileChange = async (file: File, candidateIndex: number) => {
    try {
      showLoading();
      const userId = localStorage.getItem("userId") || "";

      console.log("Uploading file immediately:", {
        fileName: file.name,
        candidateIndex: candidateIndex,
        fileSize: file.size
      });

      // Upload file ngay lên server (giống AttachedDocuments - sử dụng upfile)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", "election-entities");
      formData.append("userId", userId);

      const uploadResult = await FileService.upfile(formData);

      // Response structure: { key: string }
      if (uploadResult && uploadResult.key) {
        const fileUrl = uploadResult.key;
        console.log("File uploaded successfully, fileUrl:", fileUrl);

        // Cập nhật form với fileUrl ngay
        const currentCandidates = form.getFieldValue("candidates") || [];
        currentCandidates[candidateIndex] = {
          ...currentCandidates[candidateIndex],
          fileUrl: fileUrl, // Lưu fileUrl ngay sau khi upload
        };
        form.setFieldsValue({ candidates: currentCandidates });

        notify("Upload file thành công", "success");
      } else {
        throw new Error("Upload failed - no key returned");
      }
    } catch (error: any) {
      console.error("Error uploading file:", error);
      notify(`Lỗi khi upload file: ${error.message || 'Unknown error'}`, "error");
    } finally {
      hideLoading();
    }

    return false; // Ngăn upload tự động của Ant Design
  };

  // Hàm xử lý khi chọn ảnh profile - upload ngay lên server và lưu vào metaData
  const handleImageChange = async (file: File, candidateIndex: number) => {
    try {
      showLoading();

      console.log("Uploading profile image immediately:", {
        fileName: file.name,
        candidateIndex: candidateIndex,
        fileSize: file.size
      });

      // Upload ảnh profile ngay lên server
      const uploadResult = await FileService.uploadProfileImage(file);

      // Response structure: { key: string, url: string }
      if (uploadResult && uploadResult.key) {
        const imageUrl = uploadResult.key;
        console.log("Profile image uploaded successfully, imageUrl:", imageUrl);

        // Cập nhật form với imageUrl vào metaData
        const currentCandidates = form.getFieldValue("candidates") || [];
        const currentMetaData = currentCandidates[candidateIndex]?.metaData || {};
        currentCandidates[candidateIndex] = {
          ...currentCandidates[candidateIndex],
          metaData: {
            ...currentMetaData,
            image: imageUrl, // Lưu imageUrl vào metaData
          },
        };
        form.setFieldsValue({ candidates: currentCandidates });

        notify("Upload ảnh thành công", "success");
      } else {
        throw new Error("Upload failed - no key returned");
      }
    } catch (error: any) {
      console.error("Error uploading profile image:", error);
      notify(`Lỗi khi upload ảnh: ${error.message || 'Unknown error'}`, "error");
    } finally {
      hideLoading();
    }

    return false; // Ngăn upload tự động của Ant Design
  };

  // Hàm xóa ảnh profile
  const handleRemoveImage = async (candidateIndex: number) => {
    try {
      const currentCandidates = form.getFieldValue("candidates") || [];
      const candidate = currentCandidates[candidateIndex];
      const imageUrl = candidate?.metaData?.image;

      // Nếu có imageUrl, xóa ảnh trên server
      if (imageUrl) {
        showLoading();
        try {
          // Parse imageUrl để lấy fileType, userId, fileName
          // Format: election-entities-profile/{userId}/{fileName}
          const urlParts = imageUrl.split("/");
          if (urlParts.length >= 3) {
            const fileType = urlParts[0]; // election-entities-profile
            const userId = urlParts[1];
            const fileName = urlParts.slice(2).join("/"); // Phần còn lại là fileName

            await FileService.deleteFile(fileType, userId, fileName);
            console.log("Profile image deleted from server:", { fileType, userId, fileName });
            notify("Đã xóa ảnh", "success");
          } else {
            // Fallback: nếu không parse được, dùng deleteFileByKey
            console.warn("Cannot parse imageUrl, using deleteFileByKey:", imageUrl);
            await FileService.deleteFileByKey(imageUrl);
            notify("Đã xóa ảnh", "success");
          }
        } catch (error) {
          console.error("Error deleting profile image from server:", error);
          // Không throw error để vẫn có thể xóa trong form
        } finally {
          hideLoading();
        }
      }

      // Cập nhật form - xóa imageUrl khỏi metaData
      const currentMetaData = candidate?.metaData || {};
      currentCandidates[candidateIndex] = {
        ...currentCandidates[candidateIndex],
        metaData: {
          ...currentMetaData,
          image: "", // Xóa imageUrl
        },
      };
      form.setFieldsValue({ candidates: currentCandidates });
    } catch (error) {
      console.error("Error in handleRemoveImage:", error);
    }
  };

  const handleRemoveFile = async (candidateIndex: number) => {
    try {
      const currentCandidates = form.getFieldValue("candidates") || [];
      const candidate = currentCandidates[candidateIndex];
      const fileUrl = candidate?.fileUrl;

      if (fileUrl) {
        showLoading();
        try {
          const urlParts = fileUrl.split("/");
          if (urlParts.length >= 3) {
            const fileType = urlParts[0];
            const userId = urlParts[1];
            const fileName = urlParts.slice(2).join("/");

            await FileService.deleteFile(fileType, userId, fileName);
            notify("Đã xóa file", "success");
          } else {
            await FileService.deleteFileByKey(fileUrl);
            notify("Đã xóa file", "success");
          }
        } catch (error) {
          console.error("Error deleting file from server:", error);
        } finally {
          hideLoading();
        }
      }

      const updatedCandidates = currentCandidates.map((c: any, idx: number) => {
        if (idx === candidateIndex) {
          return {
            ...c,
            fileUrl: "",
          };
        }
        return c;
      });

      form.setFieldsValue({
        candidates: updatedCandidates
      });
    } catch (error) {
      console.error("Error in handleRemoveFile:", error);
    }
  };

  const handleDownloadFile = async (fileUrl: string) => {
    try {
      if (!fileUrl) {
        notify("Không tìm thấy file để tải xuống", "warning");
        return;
      }

      console.log("Downloading file:", fileUrl);
      showLoading();
      const blob = await FileService.downloadByKey(fileUrl);
      const fileName = fileUrl.split("/").pop() || "document";
      downloadBlob(blob, fileName);
      notify("Tải file thành công", "success");
    } catch (error: any) {
      console.error("Error downloading file:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải file";
      notify(errorMessage, "error");
    } finally {
      hideLoading();
    }
  };

  const selectedMethodData = methods.find((m) => m._id === selectedMethod);

  return (
    <Modal
      open={open}
      title={
        <span style={{ fontSize: "18px", fontWeight: 600 }}>
          {selectedMethodData
            ? `Quản lý danh sách bầu chọn - ${selectedMethodData.methodName}`
            : "Quản lý danh sách bầu chọn"}
        </span>
      }
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={!selectedMethodId}
        >
          Lưu danh sách
        </Button>,
      ]}
      width={900}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        {!selectedMethodId ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
            <p>Vui lòng chọn hình thức bầu cử trước khi quản lý danh sách bầu chọn</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16, padding: 12, background: "#f0f2f5", borderRadius: 6 }}>
              <Text strong>Hình thức đã chọn: </Text>
              <Tag color="green" style={{ marginLeft: 8 }}>
                {selectedMethodData?.methodName || "Chưa chọn"}
              </Tag>
            </div>

            {/* RADIO BUTTON CHỌN LOẠI FORM */}
            <div style={{ marginBottom: 24, padding: 16, background: "#fff", border: "1px solid #e8e8e8", borderRadius: 6 }}>
              <Text strong style={{ display: "block", marginBottom: 12 }}>Chọn loại form: </Text>
              <Radio.Group
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                style={{ width: "100%" }}
              >
                <Radio value="person">Nhập người</Radio>
                <Radio value="project">Nhập dự án</Radio>
                <Radio value="other">Khác</Radio>
              </Radio.Group>
            </div>

            {selectedMethod && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>📄 Danh sách bầu chọn</h3>
            <Form.List name="candidates">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{
                        marginBottom: 16,
                        padding: 16,
                        border: "1px solid #e8e8e8",
                        borderRadius: 8,
                        backgroundColor: "#fafafa",
                      }}
                    >
                      {/* FORM CHUNG DỰA TRÊN formType - KHÔNG PHỤ THUỘC VÀO HÌNH THỨC BẦU CỬ */}
                      {formType === "person" ? (
                        // FORM NHẬP NGƯỜI
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "title"]}
                              label="Tiêu đề"
                              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                            >
                              <Input placeholder="Nhập tiêu đề" />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "description"]}
                              label="Mô tả"
                              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                            >
                              <Input placeholder="Nhập mô tả" />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "fullName"]}
                              label="Họ và tên"
                              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                            >
                              <Input placeholder="Nhập họ và tên" />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "age"]}
                              label="Tuổi"
                            >
                              <Input placeholder="Nhập tuổi" />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "department"]}
                              label="Phòng ban"
                            >
                              <Input placeholder="Nhập phòng ban" />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "position"]}
                              label="Vị trí"
                            >
                              <Input placeholder="Nhập vị trí" />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "fileUrl"]}
                              label="Tài liệu đính kèm"
                            >
                              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => {
                                const prevFileUrl = prevValues?.candidates?.[name]?.fileUrl;
                                const currentFileUrl = currentValues?.candidates?.[name]?.fileUrl;
                                return prevFileUrl !== currentFileUrl;
                              }}>
                                {() => {
                                  const fileUrl = form.getFieldValue(["candidates", name, "fileUrl"]);

                                  const fileList = [];
                                  if (fileUrl) {
                                    const fileName = fileUrl.split("/").pop() || "File đã tải";
                                    fileList.push({
                                      uid: `file-${name}`,
                                      name: fileName,
                                      status: "done",
                                      url: fileUrl, // Thêm url để Upload component có thể download
                                    });
                                  }

                                  return (
                                    <Upload
                                      beforeUpload={(file) => handleFileChange(file, name)}
                                      onRemove={async () => {
                                        // Gọi handleRemoveFile để xóa file trên server và xóa fileUrl khỏi form
                                        await handleRemoveFile(name);
                                      }}
                                      maxCount={1}
                                      fileList={fileList as any}
                                      itemRender={(originNode, file, fileList, actions) => {
                                        return (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ flex: 1 }}>{originNode}</span>
                                            {fileUrl && (
                                              <Button
                                                type="text"
                                                icon={<DownloadOutlined />}
                                                size="small"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDownloadFile(fileUrl);
                                                }}
                                                title="Tải xuống"
                                              />
                                            )}
                                            <Button
                                              type="text"
                                              danger
                                              size="small"
                                              icon={<DeleteOutlined />}
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                // Gọi handleRemoveFile để xóa file trên server và xóa fileUrl khỏi form
                                                await handleRemoveFile(name);
                                              }}
                                              title="Xóa"
                                            />
                                          </div>
                                        );
                                      }}
                                    >
                                      <Button icon={<PlusOutlined />}>Tải file</Button>
                                    </Upload>
                                  );
                                }}
                              </Form.Item>
                            </Form.Item>
                          </Col>

                          <Col span={24}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "experience"]}
                              label="Kinh nghiệm"
                            >
                              <Input.TextArea rows={2} placeholder="Nhập kinh nghiệm" />
                            </Form.Item>
                          </Col>

                          <Col span={24}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "achievements"]}
                              label="Thành tích"
                            >
                              <Input.TextArea rows={2} placeholder="Nhập thành tích" />
                            </Form.Item>
                          </Col>
                        </Row>
                      ) : formType === "project" ? (
                        // FORM NHẬP DỰ ÁN
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "title"]}
                              label="Tiêu đề"
                              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                            >
                              <Input placeholder="Nhập tiêu đề" />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "description"]}
                              label="Mô tả"
                              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                            >
                              <Input placeholder="Nhập mô tả" />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "projectName"]}
                              label="Tên dự án"
                              rules={[{ required: true, message: "Vui lòng nhập tên dự án" }]}
                            >
                              <Input placeholder="Nhập tên dự án" />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "budget"]}
                              label="Ngân sách"
                            >
                              <Input placeholder="Nhập ngân sách" />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "duration"]}
                              label="Thời gian thực hiện"
                            >
                              <Input placeholder="VD: 6 tháng, 1 năm..." />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "location"]}
                              label="Địa điểm"
                            >
                              <Input placeholder="Nhập địa điểm" />
                            </Form.Item>
                          </Col>

                          <Col span={24}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "projectDescription"]}
                              label="Mô tả chi tiết dự án"
                            >
                              <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết về dự án" />
                            </Form.Item>
                          </Col>

                          <Col span={24}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "objectives"]}
                              label="Mục tiêu dự án"
                            >
                              <Input.TextArea rows={2} placeholder="Nhập mục tiêu của dự án" />
                            </Form.Item>
                          </Col>

                          <Col span={24}>
                            <Form.Item
                              {...restField}
                              name={[name, "metaData", "benefits"]}
                              label="Lợi ích dự án"
                            >
                              <Input.TextArea rows={2} placeholder="Nhập lợi ích của dự án" />
                            </Form.Item>
                          </Col>

                          <Col span={24}>
                            <Form.Item
                              {...restField}
                              name={[name, "fileUrl"]}
                              label="Tài liệu đính kèm"
                            >
                              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => {
                                const prevFileUrl = prevValues?.candidates?.[name]?.fileUrl;
                                const currentFileUrl = currentValues?.candidates?.[name]?.fileUrl;
                                return prevFileUrl !== currentFileUrl;
                              }}>
                                {() => {
                                  const fileUrl = form.getFieldValue(["candidates", name, "fileUrl"]);

                                  const fileList = [];
                                  if (fileUrl) {
                                    const fileName = fileUrl.split("/").pop() || "File đã tải";
                                    fileList.push({
                                      uid: `file-${name}`,
                                      name: fileName,
                                      status: "done",
                                      url: fileUrl, // Thêm url để Upload component có thể download
                                    });
                                  }

                                  return (
                                    <Upload
                                      beforeUpload={(file) => handleFileChange(file, name)}
                                      onRemove={async () => {
                                        await handleRemoveFile(name);
                                      }}
                                      maxCount={1}
                                      fileList={fileList as any}
                                      itemRender={(originNode, file, fileList, actions) => {
                                        return (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ flex: 1 }}>{originNode}</span>
                                            {fileUrl && (
                                              <Button
                                                type="text"
                                                icon={<DownloadOutlined />}
                                                size="small"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDownloadFile(fileUrl);
                                                }}
                                                title="Tải xuống"
                                              />
                                            )}
                                            <Button
                                              type="text"
                                              danger
                                              size="small"
                                              icon={<DeleteOutlined />}
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                // Gọi handleRemoveFile để xóa file trên server và xóa fileUrl khỏi form
                                                await handleRemoveFile(name);
                                              }}
                                              title="Xóa"
                                            />
                                          </div>
                                        );
                                      }}
                                    >
                                      <Button icon={<PlusOutlined />}>Tải file</Button>
                                    </Upload>
                                  );
                                }}
                              </Form.Item>
                            </Form.Item>
                          </Col>
                        </Row>
                      ) : (
                        // FORM KHÁC (cho hình thức chấp thuận/không chấp thuận)
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "title"]}
                              label="Tiêu đề"
                              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                            >
                              <Input placeholder="Nhập tiêu đề" />
                            </Form.Item>
                          </Col>

                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "description"]}
                              label="Mô tả"
                              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                            >
                              <Input placeholder="Nhập mô tả" />
                            </Form.Item>
                          </Col>

                          <Col span={24}>
                            <Form.Item
                              {...restField}
                              name={[name, "fileUrl"]}
                              label="Tài liệu đính kèm"
                            >
                              <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => {
                                const prevFileUrl = prevValues?.candidates?.[name]?.fileUrl;
                                const currentFileUrl = currentValues?.candidates?.[name]?.fileUrl;
                                return prevFileUrl !== currentFileUrl;
                              }}>
                                {() => {
                                  const fileUrl = form.getFieldValue(["candidates", name, "fileUrl"]);

                                  const fileList = [];
                                  if (fileUrl) {
                                    const fileName = fileUrl.split("/").pop() || "File đã tải";
                                    fileList.push({
                                      uid: `file-${name}`,
                                      name: fileName,
                                      status: "done",
                                      url: fileUrl, // Thêm url để Upload component có thể download
                                    });
                                  }

                                  return (
                                    <Upload
                                      beforeUpload={(file) => handleFileChange(file, name)}
                                      onRemove={async () => {
                                        // Gọi handleRemoveFile để xóa file trên server và xóa fileUrl khỏi form
                                        await handleRemoveFile(name);
                                      }}
                                      maxCount={1}
                                      fileList={fileList as any}
                                      itemRender={(originNode, file, fileList, actions) => {
                                        return (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ flex: 1 }}>{originNode}</span>
                                            {fileUrl && (
                                              <Button
                                                type="text"
                                                icon={<DownloadOutlined />}
                                                size="small"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDownloadFile(fileUrl);
                                                }}
                                                title="Tải xuống"
                                              />
                                            )}
                                            <Button
                                              type="text"
                                              danger
                                              size="small"
                                              icon={<DeleteOutlined />}
                                              onClick={async (e) => {
                                                e.stopPropagation();
                                                // Gọi handleRemoveFile để xóa file trên server và xóa fileUrl khỏi form
                                                await handleRemoveFile(name);
                                              }}
                                              title="Xóa"
                                            />
                                          </div>
                                        );
                                      }}
                                    >
                                      <Button icon={<PlusOutlined />}>Tải file</Button>
                                    </Upload>
                                  );
                                }}
                              </Form.Item>
                            </Form.Item>
                          </Col>
                        </Row>
                      )}

                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        style={{ marginTop: 8 }}
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => add({ ...emptyCandidate, formType: formType })}
                    icon={<PlusOutlined />}
                    style={{ width: "100%", marginTop: 8 }}
                  >
                    + Thêm nội dung bầu chọn
                  </Button>
                </div>
              )}
            </Form.List>
          </div>
        )}
          </>
        )}
      </Form>
    </Modal>
  );
};

export default VotingMethodModal;

