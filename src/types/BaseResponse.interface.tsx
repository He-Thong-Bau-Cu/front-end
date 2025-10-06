export interface BaseResponse<T = any> {
  status: number;
  success: boolean;
  message: string;
  data?: T | null;
  otherData?: T | null;
  path?: string;
  timestamp?: any;
}
