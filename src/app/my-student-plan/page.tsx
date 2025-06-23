"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./mystudy.css";

export default function MyStudentPlan() {
  const [plans, setPlans] = useState<any[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newDuration, setNewDuration] = useState<string>("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/student-plans`)
      .then((res) => res.json())
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching student plans:", err));
  }, []);

  const handleAddPlan = () => {
    if (!newTitle.trim() || !newDueDate || !newStartTime) return;

    const newPlan = {
      title: newTitle.trim(),
      description: newDescription.trim(),
      due_date: newDueDate,
      start_time: newStartTime,
      duration: newDuration.trim() !== "" ? newDuration.trim() : null,
    };
    setPlans((prev) => [...prev, newPlan]);

    setNewTitle("");
    setNewDescription("");
    setNewDueDate("");
    setNewStartTime("");
    setNewDuration("");
  };

  return (
    <div className="p-4">
      <div className="top-right-button">
        <Link href="/room-announcement" className="nav-btn3">Room Announcement</Link>
        <Link href="/Logins" className="nav-btn">Manage Due</Link>
        <Link href="/" className="nav-btn2">Work on Due Report</Link>
        <Link href="/my-student-plan" className="nav-btn">My Study Plan</Link>
      </div>

      <h1 className="page-title">My Study Plan</h1>

      <div className="add-form">
        <input
          className="input"
          placeholder="Activity Title *"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <textarea
          className="textarea"
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <input
          type="date"
          className="input"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
        />
        <div className="time-duration-group">
          <input
            type="time"
            className="input"
            value={newStartTime}
            onChange={(e) => setNewStartTime(e.target.value)}
          />
          <input
            type="number"
            className="input"
            min={0}
            placeholder="Estimate Duration (hrs)"
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
          />
        </div>
        <button className="add-btn" onClick={handleAddPlan}>
          Add More Activity
        </button>
      </div>

      <div className="plan-container">
        {plans.length === 0 ? (
          <div className="plan-empty">No Study Plan Yet</div>
        ) : (
          <ul className="plan-list">
            {plans.map((plan, index) => (
              <li key={index} className="plan-item">
                <div className="plan-time">
                  <strong>{plan.start_time || "-"}</strong> ·{" "}
                  {plan.duration !== null && plan.duration !== undefined && plan.duration !== ""
                    ? `${plan.duration} hr${Number(plan.duration) > 1 ? "s" : ""}`
                    : "-"}
                </div>
                <div className="plan-title">{plan.title}</div>
                <div className="plan-desc">{plan.description}</div>
                <div className="plan-date">
                  Due: {new Date(plan.due_date).toLocaleDateString("en-GB")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
