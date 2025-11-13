import "./../../style/secretary/DraftingDocuments.model.css";
import ElectionList from "@/components/secretary/drafting-documents/ElectionList";

const DraftingDocuments: React.FC = () => {

  return (
    <div className="meeting-container">
     <ElectionList/>
    </div>
  );
};

export default DraftingDocuments;
