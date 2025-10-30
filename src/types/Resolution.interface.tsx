// src/interfaces/Resolution.ts
import { ReactNode } from "react";

/**
 * Cấu trúc từng điều khoản trong nghị quyết
 */
export interface ResolutionClause {
  title: string;
  content: string;
}

/**
 * Dữ liệu nghị quyết chi tiết
 */
export interface Resolution {
  title: string;
  code: string;
  date: string;
  intro: string;
  clauses: ResolutionClause[];
}

/**
 * Tuỳ chọn biểu quyết (Tán thành / Không tán thành / Không ý kiến)
 */
export interface VotingOption {
  key: string;
  label: string;
  icon: ReactNode;
  description: string;
  color: string;
}
