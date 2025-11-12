// src/interfaces/Delegate.ts

/**
 * Cấu trúc thông tin của một đại biểu (delegate)
 */
export interface Delegate {
  session: string; // Khóa họp (ví dụ: XVI)
  term: string; // Nhiệm kỳ (ví dụ: "Nhiệm kỳ 2021–2026")
  name: string; // Họ tên đầy đủ
  avatarText: string; // Chữ viết tắt avatar (VD: "NA")
  area: string; // Khu vực đại diện
  status: string; // Trạng thái hoạt động
  id: string; // Mã thẻ đại biểu
  issued: string; // Ngày cấp
  dob: string; // Ngày sinh
  idNumber: string; // Số CCCD/CMND
  email: string; // Địa chỉ email
  phone: string; // Số điện thoại
  party: string; // Đảng phái
  position: string; // Chức vụ
  office: string; // Nơi làm việc / Văn phòng
  field: string; // Lĩnh vực phụ trách
  constituency: string; // Khu vực / số lượng cử tri đại diện
}



/**
 * Cấu trúc thông tin người dùng trong ủy quyền
 */
export interface AuthorizationUser {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  position: string;
}

/**
 * Cấu trúc thông tin chi tiết ủy quyền
 */
export interface DelegationDetail {
  documentId: string | null;
  delegateReason: string | null;
  signature: string | null;
  _id: string;
  delegationType: string;
  electionId: string | null;
  delegatorId: AuthorizationUser;
  delegateId: AuthorizationUser;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  status: string;
  confirmedBy: AuthorizationUser | null;
  confirmedAt: string | null; // ISO date string
  updatedAt: string; // ISO date string
  createdAt: string; // ISO date string
  __v: number;
}