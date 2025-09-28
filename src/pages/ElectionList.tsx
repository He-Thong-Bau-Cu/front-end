import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/ElectionList.module.css";

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
  },
];

export default function ElectionList() {
  const navigate = useNavigate();

  const handleRowClick = (id: number) => {
    navigate(`/election/${id}`);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Election List</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Voting Method</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Company Type</th>
          </tr>
        </thead>
        <tbody>
          {ELECTIONS.map((e) => (
            <tr
              key={e.election_id}
              className={styles.row}
              onClick={() => handleRowClick(e.election_id)}
              style={{ cursor: "pointer" }}
            >
              <td>{e.title}</td>
              <td>{e.election_type}</td>
              <td>{e.voting_method}</td>
              <td>{e.start_date}</td>
              <td>{e.end_date}</td>
              <td>
                <span
                  className={[
                    styles.statusBadge,
                    e.status === "Active"
                      ? styles.statusActive
                      : e.status === "Upcoming"
                      ? styles.statusUpcoming
                      : styles.statusClosed,
                  ].join(" ")}
                >
                  {e.status}
                </span>
              </td>
              <td>{e.company_type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
