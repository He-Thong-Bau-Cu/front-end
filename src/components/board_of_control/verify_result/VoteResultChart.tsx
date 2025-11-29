import React from "react";
import { CandidateResult } from "../../../types/ElectionVerification.interface";

export default function VoteResultChart({ data }: { data: CandidateResult[] }) {
  return (
    <section className="ev-section ev-result">
      <h3 className="ev-section-title">1. Kết quả Bầu cử Sơ bộ</h3>

      <div className="ev-result-list">
        {data.map((item, index) => {
          // Xử lý cả 2 trường hợp: entityTitle có thể là string hoặc number
          const candidateName = typeof item.entityTitle === 'string'
            ? item.entityTitle
            : `Ứng viên ${index + 1}`;
          const votes = item.totalVotes || (typeof item.entityTitle === 'number' ? item.entityTitle : 0);
          const percent = item.percentage || 0;

          return (
            <div key={index} className="ev-result-row">
              <div className="ev-result-header">
                <span className="ev-candidate">{candidateName}</span>
                <span className="ev-result-value">
                  {votes} phiếu ({percent}%)
                </span>
              </div>
              <div className="ev-bar-wrap">
                <div
                  className="ev-bar"
                  style={{
                    width: `${percent}%`,
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
