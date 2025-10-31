import React from "react";
import { CandidateResult } from "../../../types/ElectionVerification.interface";

export default function VoteResultChart({ data }: { data: CandidateResult[] }) {
  return (
    <section className="ev-section ev-result">
      <h3 className="ev-section-title">1. Kết quả Bầu cử Sơ bộ</h3>

      <div className="ev-result-list">
        {data.map((item, index) => (
          <div key={index} className="ev-result-row">
            <div className="ev-result-header">
              <span className="ev-candidate">{item.name}</span>
              <span className="ev-result-value">
                {item.votes} phiếu ({item.percent}%)
              </span>
            </div>
            <div className="ev-bar-wrap">
              <div
                className="ev-bar"
                style={{
                  width: `${item.percent}%`,
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}