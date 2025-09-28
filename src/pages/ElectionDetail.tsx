import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "../styles/ElectionDetail.module.css";

// Dữ liệu mẫu cứng
const ELECTIONS = [
  {
    election_id: 1,
    title: "Board Member Election 2025",
    election_type: "MEMBER_ELECTION",
    voting_method: "SINGLE_CHOICE",
    start_date: "2025-09-01",
    end_date: "2025-09-10",
    status: "Active",
    company_type: "Corporation",
    created_by: 1,
  },
  {
    election_id: 2,
    title: "Plan Voting Q4",
    election_type: "PLAN_VOTING",
    voting_method: "YES_NO",
    start_date: "2025-10-01",
    end_date: "2025-10-05",
    status: "Upcoming",
    company_type: "LLC",
    created_by: 2,
  },
  {
    election_id: 3,
    title: "Excellence Award 2025",
    election_type: "EXCELLENCE_AWARD",
    voting_method: "CUMULATIVE",
    start_date: "2025-08-15",
    end_date: "2025-08-20",
    status: "Closed",
    company_type: "Corporation",
    created_by: 3,
  },
];

export default function ElectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const electionId = Number(id);

  const [editing, setEditing] = useState(false);
  const [elections, setElections] = useState(ELECTIONS);
  const election = elections.find((e) => e.election_id === electionId);

  const [form, setForm] = useState(
    election
      ? { ...election }
      : {
          title: "",
          election_type: "",
          voting_method: "",
          start_date: "",
          end_date: "",
          status: "",
          company_type: "",
          created_by: 1,
        }
  );

  // Xóa election
  const handleDelete = () => {
    setElections(elections.filter((e) => e.election_id !== electionId));
    navigate("/elections");
  };

  // Sửa election
  const handleEdit = () => setEditing(true);

  // Lưu election đã sửa
  const handleSave = () => {
    setElections(
      elections.map((e) =>
        e.election_id === electionId ? { ...form, election_id: electionId } : e
      )
    );
    setEditing(false);
  };

  // Thêm election mới
  const handleAdd = () => {
    const newId = Math.max(...elections.map((e) => e.election_id), 0) + 1;
    setElections([...elections, { ...form, election_id: newId }]);
    navigate(`/elections`);
  };

  if (!election && !editing) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Election not found.</h2>
        <button className={styles.addBtn} onClick={() => setEditing(true)}>
          Add New Election
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {editing
          ? election
            ? "Edit Election"
            : "Add New Election"
          : "Election Detail"}
      </h2>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          if (!editing) return;

          if (election) {
            handleSave();
          } else {
            handleAdd();
          }
        }}
      >
        <div className={styles.field}>
          <label>Title:</label>
          <input
            type="text"
            value={form.title}
            disabled={!editing}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label>Type:</label>
          <input
            type="text"
            value={form.election_type}
            disabled={!editing}
            onChange={(e) =>
              setForm({ ...form, election_type: e.target.value })
            }
          />
        </div>
        <div className={styles.field}>
          <label>Voting Method:</label>
          <input
            type="text"
            value={form.voting_method}
            disabled={!editing}
            onChange={(e) =>
              setForm({ ...form, voting_method: e.target.value })
            }
          />
        </div>
        <div className={styles.field}>
          <label>Start Date:</label>
          <input
            type="date"
            value={form.start_date}
            disabled={!editing}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label>End Date:</label>
          <input
            type="date"
            value={form.end_date}
            disabled={!editing}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label>Status:</label>
          <input
            type="text"
            value={form.status}
            disabled={!editing}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label>Company Type:</label>
          <input
            type="text"
            value={form.company_type}
            disabled={!editing}
            onChange={(e) => setForm({ ...form, company_type: e.target.value })}
          />
        </div>
        {editing && (
          <button className={styles.saveBtn} type="submit">
            {election ? "Save" : "Add"}
          </button>
        )}
      </form>
      {!editing && (
        <div className={styles.actions}>
          <button className={styles.editBtn} onClick={handleEdit}>
            Edit
          </button>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
      {/* Trường document: Link sang trang tài liệu của election */}
      {!editing && (
        <div style={{ textAlign: "center", margin: "18px 0" }}>
          <Link className={styles.docBtn} to={`/documents/${electionId}`}>
            View Documents for this Election
          </Link>
        </div>
      )}
      <button className={styles.backBtn} onClick={() => navigate("/elections")}>
        Back to List
      </button>
    </div>
  );
}
