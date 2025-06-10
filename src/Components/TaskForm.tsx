"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TaskForm() {
  const [dueDate, setDueDate] = useState("");
  const [teacher, setTeacher] = useState("");
  const [subject, setSubject] = useState("");
  const [workType, setWorkType] = useState("Group");
  const [wtf, setWtf] = useState("");
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects`)
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error("Error loading subjects:", err));
  }, []);

  const handleSubmit = async () => {
    if (!dueDate || !teacher || !subject || !wtf) {
      alert("Please fill in all required fields.");
      return;
    }
    const dueDateISOString = new Date(dueDate).toISOString();

    const body = {
      task_id: "TASK_" + Date.now(),
      due_date: dueDateISOString,
      teacher,
      subject,
      wtf,
      work_type: workType,
      created_by: null,
      created_on: new Date().toISOString(),
      delindicator: false,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        alert("Failed to add task: " + (error.error || res.statusText));
        return;
      }

      alert("Task Added!");
      // เคลียร์ฟอร์ม
      setDueDate("");
      setTeacher("");
      setSubject("");
      setWorkType("Group");
      setWtf("");
      window.location.reload();
    } catch (error) {
      alert("Network error");
    }
  };

  return (
    <div className="p-4">
      <div className="home-btn">
        <Link href="/Reports" className="nav-btn">
          ไปหน้ารายการงาน (Task List)
        </Link>
      </div>

      <label className="form-label">Due Date *</label>

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="form-input"
      />
      <label className="form-label">Teacher *</label>
      <select
        value={teacher}
        onChange={(e) => setTeacher(e.target.value)}
        className="form-select mb-2"
      >
        <option value="">Select Teacher</option>
        {[...new Set(subjects.map((s) => s.teacher))].map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <label className="form-label">Subject *</label>
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="form-select mb-2"
      >
        <option value="">Select Subject</option>
        {subjects
          .filter((s) => s.teacher === teacher)
          .map((s, i) => (
            <option key={i} value={s.subject}>
              {s.subject}
            </option>
          ))}
      </select>
      <label className="form-label">Work Type *</label>
      <select
        value={workType}
        onChange={(e) => setWorkType(e.target.value)}
        className="form-select mb-2"
      >
        <option>Group</option>
        <option>Personal</option>
        <option>School Event</option>
      </select>
      <label className="form-label">What to finish *</label>
      <textarea
        value={wtf}
        onChange={(e) => setWtf(e.target.value)}
        placeholder="What to finish"
        className="form-textarea mb-2"
      />
      <button onClick={handleSubmit} className="btn-primary">
        Add Task
      </button>
    </div>
  );
}
