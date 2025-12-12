import React, { useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../styles/ElectionDocuments.module.css";

// Dữ liệu mẫu cứng
const ELECTIONS = [
  {
    election_id: 1,
    title: "Board Member Election 2025",
  },
  {
    election_id: 2,
    title: "Plan Voting Q4",
  },
  {
    election_id: 3,
    title: "Excellence Award 2025",
  },
];

const DOCUMENTS = [
  {
    doc_id: 101,
    election_id: 1,
    title: "Election Rules",
    file_url: "https://example.com/rules.pdf",
    status: "Approved",
    created_at: "2025-08-20T10:00:00Z",
  },
  {
    doc_id: 102,
    election_id: 1,
    title: "Candidate List",
    file_url: "https://example.com/candidates.pdf",
    status: "PendingApproval",
    created_at: "2025-08-21T09:00:00Z",
  },
  {
    doc_id: 201,
    election_id: 2,
    title: "Plan Details",
    file_url: "https://example.com/plan.pdf",
    status: "Draft",
    created_at: "2025-09-25T09:00:00Z",
  },
  {
    doc_id: 301,
    election_id: 3,
    title: "Award Nominees",
    file_url: "https://example.com/award.pdf",
    status: "Approved",
    created_at: "2025-08-10T09:00:00Z",
  },
];

export default function ElectionDocuments() {
  const { id } = useParams();
  const electionId = Number(id);
  const election = ELECTIONS.find((e) => e.election_id === electionId);

  const [uploadedFiles, setUploadedFiles] = useState(
    DOCUMENTS.filter((doc) => doc.election_id === electionId)
  );
  const [fileTitle, setFileTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTitle || !fileUrl) return;
    const newDoc = {
      doc_id: Date.now(),
      election_id: electionId,
      title: fileTitle,
      file_url: fileUrl,
      status: "Draft",
      created_at: new Date().toISOString(),
    };
    setUploadedFiles([newDoc, ...uploadedFiles]);
    setFileTitle("");
    setFileUrl("");
  };

  if (!election) {
    return <div className={styles.container}>Election not found.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Election Documents for: {election.title}</h2>

      <form onSubmit={handleUpload} className={styles.form}>
        <h3>Upload Document</h3>
        <div>
          <input
            type="text"
            placeholder="Document Title"
            value={fileTitle}
            onChange={(e) => setFileTitle(e.target.value)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="File URL"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
          />
        </div>
        <button type="submit">Upload</button>
      </form>

      <h3>Uploaded Documents</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Uploaded At</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          {uploadedFiles.map((doc) => (
            <tr key={doc.doc_id}>
              <td>{doc.title}</td>
              <td>{doc.status}</td>
              <td>{(() => { const date = new Date(doc.created_at); const h = String(date.getHours()).padStart(2, '0'); const m = String(date.getMinutes()).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${h}:${m} ${day}/${month}/${year}`; })()}</td>
              <td>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View File
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
