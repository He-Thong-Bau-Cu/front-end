import React from "react";
import { FileTextOutlined } from "@ant-design/icons";

export default function ArchiveHeader() {
    return (
        <div className="ra-header">
            <div className="ra-header-left">

                <div>
                    <div className="ra-header-title">
                        <FileTextOutlined className="ra-header-icon" />
                        <span>Kho Lưu Trữ Báo Cáo</span>
                    </div>
                    <p className="ra-header-subtitle">
                        Tra cứu, xem lại và tải xuống các báo cáo đã được xác thực và lưu trữ chính thức.
                    </p>
                </div>
            </div>
        </div>
    );
}
