import DocumentContent from "@/components/secretary/management-document/DocumentContent";
import DocumentSidebar from "@/components/secretary/management-document/DocumentSidebar";
import '../../style/secretary/ManagementDocument.model.css'
import { useState } from "react";


const ManagementDocument: React.FC = () => {
    const [activeFolder, setActiveFolder] = useState("Báo cáo Tài chính");
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);


    return (
        <div className="document-page">
            <DocumentSidebar
                activeFolder={activeFolder}
                onSelectFolder={setActiveFolder}
                selectedTypes={selectedTypes}
                onSelectTypes={setSelectedTypes}
            />

            <DocumentContent
                activeFolder={activeFolder}
                selectedTypes={selectedTypes}
            />
        </div>
    );
};

export default ManagementDocument;

