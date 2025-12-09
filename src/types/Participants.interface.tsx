export interface Participant {
  _id?: string; // ID từ backend (nếu có = edit, không có = mới)
  id?: number; // ID tạm cho UI
  userId?: string; // Optional vì có thể import voter không có user trong hệ thống
  fullName: string;
  email: string;
  position?: string;
  status: string;
  phone?: string;
  citizenId?: string;
  address?: string;
  department?: string;
  percentage?: number;
  isImportedFromExcel?: boolean; // Đánh dấu voter được import từ Excel
}
