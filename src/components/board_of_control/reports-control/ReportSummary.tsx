import React from "react";
import {
  SafetyCertificateOutlined,
  SettingOutlined,
  DashboardOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { ReportSummaryCard } from "../../../types/SystemAuditReport.interface";

export default function ReportSummary({ cards }: { cards: ReportSummaryCard[] }) {
  const icons = [
    <SafetyCertificateOutlined />,
    <SettingOutlined />,
    <DashboardOutlined />,
    <DatabaseOutlined />,
  ];

  // màu cho từng card
  const accentColors = ["#fa8c16", "#1677ff", "#52c41a", "#52c41a"];
  const iconBgColors = [
    "rgba(250,140,22,0.1)",
    "rgba(22,119,255,0.08)",
    "rgba(82,196,26,0.08)",
    "rgba(82,196,26,0.08)",
  ];

  return (
    <section className="sar-section-wrap">
      <div className="sar-section-header">
        Tổng quan & Các chỉ số chính
      </div>

      <div className="sar-summary-grid">
        {cards.map((card, i) => (
          <div
            key={i}
            className="sar-summary-card"
            style={
              {
                // custom properties for CSS ::before and icon bg
                ["--accent-color" as any]: accentColors[i] || "#1677ff",
                ["--icon-bg" as any]: iconBgColors[i] || "rgba(22,119,255,0.08)",
              } as React.CSSProperties
            }
          >
            <div className="sar-summary-icon">{icons[i]}</div>

            <div className="sar-summary-text">
              <div className="sar-summary-label">{card.title}</div>

              <div
                className={
                  "sar-summary-value " +
                  (card.highlight ? "sar-summary-valid" : "")
                }
              >
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
