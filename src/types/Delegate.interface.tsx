// src/interfaces/Delegate.ts

import { User1 } from "./User.interface";

/**
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




export interface AuthorizationUser {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  position: string;
}


export interface DelegationDetail {
  documentId: string | null;
  delegateReason: string | null;
  signature: string | null;
  _id: string;
  delegationType: string;
  electionId: string | null;
  delegatorId: AuthorizationUser;
  delegateId: AuthorizationUser | null;
  delegateInfo?: {
    fullName: string;
    citizenId: string;
    phone: string;
    email: string;
    address: string;
  };
  startDate: string;
  endDate: string;
  status: string;
  confirmedBy: AuthorizationUser | null;
  confirmedAt: string | null;
  updatedAt: string;
  createdAt: string;
  __v: number;
}



export interface DelegationSearch {
  _id: string;
  electionId: {
    _id: string;
    title: string;
  };
  delegateId: {
    _id: string;
    fullName: string;
    email: string;
    department?: string;
    position?: string;
  } | null;

  delegateInfo?: {
    fullName: string;
    citizenId: string;
    phone: string;
    email: string;
    address: string;
  };

  delegationType: string;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
}

export interface DelegationSummary {

  id: string;
  delegateReason: string;
  timeDelegation: number;
  delegator: User1;
  delegate: User1;
  createdAt: string;
  endDate: string;
}

export type DelegationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ACTIVE"
  | "EXPIRED"
  | "REVOKED"
  | "INVALID";


export interface DelegateInfoPayload {
  fullName: string;
  citizenId: string;
  email?: string;
  phone: string;
  address?: string;
}

export interface CreateDelegationPayload {
  delegationType: "election";
  electionId: string;
  delegatorId: string;
  startDate: string;
  endDate: string;
  delegateReason: string;
  delegateInfo: DelegateInfoPayload;
}
