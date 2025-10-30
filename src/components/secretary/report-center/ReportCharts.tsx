import React from "react";
import { Line, Pie, Column } from "@ant-design/plots";

interface ReportChartsProps {
    type: "line" | "pie" | "bar";
    data: any[];
}

export default function ReportCharts({ type, data }: ReportChartsProps) {
    // === LINE CHART (Lịch sử tạo báo cáo) ===
    if (type === "line") {
        const config = {
            data,
            xField: "month",
            yField: "value",
            smooth: true,
            color: "#52C41A",
            height: 260,
            point: {
                size: 4,
                shape: "circle",
                style: {
                    fill: "#52C41A",
                    stroke: "#fff",
                    lineWidth: 1,
                },
            },
            lineStyle: {
                stroke: "url(#gradientLine)",
                lineWidth: 3,
            },
            tooltip: {
                showMarkers: false,
                formatter: (datum: any) => ({
                    name: "Số lượng báo cáo",
                    value: datum.value,
                }),
            },
            animation: {
                appear: {
                    animation: "path-in",
                    duration: 1000,
                },
            },
        };

        return (
            <div className="rc-chart-wrapper">
                <svg width="0" height="0">
                    <defs>
                        <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#B7EB8F" />
                            <stop offset="100%" stopColor="#52C41A" />
                        </linearGradient>
                    </defs>
                </svg>
                <Line {...config} />
            </div>
        );
    }

    // === PIE CHART (Phân loại báo cáo) ===
    if (type === "pie") {
        const config = {
            data,
            angleField: "value",
            colorField: "type",
            radius: 0.8,
            innerRadius: 0.6,
            color: ["#52C41A", "#1677FF", "#FAAD14"],
            label: false,
            legend: false, // Ẩn legend mặc định, tự render dưới dạng danh sách
            statistic: false,
        };

        return (
            <div className="rc-pie-wrapper">
                <Pie {...config} />
                <ul className="rc-pie-legend">
                    {data.map((item, i) => (
                        <li key={i}>
                            <span
                                className="rc-dot"
                                style={{ backgroundColor: config.color[i] }}
                            ></span>
                            {item.type} ({item.value}%)
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    // === BAR CHART (So sánh tỷ lệ tham gia) ===
    if (type === "bar") {
        const config = {
            data,
            xField: "category",
            yField: "value",
            columnStyle: {
                radius: [8, 8, 0, 0],
            },
            color: ({ category }: any) => {
                const gradient = {
                    HĐQT: "l(90) 0:#d9f7be 1:#52c41a",
                    BKS: "l(90) 0:#b7eb8f 1:#73d13d",
                    "Tín nhiệm": "l(90) 0:#d9f7be 1:#52c41a",
                    "ĐH Cổ đông": "l(90) 0:#b7eb8f 1:#52c41a",
                };
                return gradient[category] || "l(90) 0:#b7eb8f 1:#52c41a";
            },
            columnWidthRatio: 0.5,
            xAxis: {
                label: {
                    style: {
                        fontSize: 12,
                        fill: "#333",
                        fontWeight: 500,
                    },
                },
                line: null,
            },
            yAxis: false,
            tooltip: {
                showMarkers: false,
                formatter: (datum: any) => ({
                    name: datum.category,
                    value: `${datum.value}%`,
                }),
            },
            animation: {
                appear: {
                    animation: "scale-in-y",
                    duration: 800,
                },
            },
        };

        return (
            <div className="rc-bar-wrapper">
                <Column {...config} />
            </div>
        );
    }

    return null;
}
