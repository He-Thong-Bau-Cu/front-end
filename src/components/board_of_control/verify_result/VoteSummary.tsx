import React from "react";
import { VoteSummaryCard } from "../../../types/ElectionVerification.interface";

export default function VoteSummary({ cards }: { cards: VoteSummaryCard[] }) {
  return (
    <section className="ev-section ev-summary">
      <h3 className="ev-section-title">2. Thống kê Phiếu bầu</h3>

      <div className="ev-summary-grid">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`ev-summary-box ${card.highlight ? "highlight" : ""}`}
          >
            <div className="ev-summary-title">{card.title}</div>
            <div className="ev-summary-value">{card.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
