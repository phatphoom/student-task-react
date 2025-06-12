"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Subject } from "@/types";

export default function TaskForm() {
  const [dueDate, setDueDate] = useState("");
  const [teacher, setTeacher] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [workType, setWorkType] = useState<string>("Group");
  const [wtf, setWtf] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]); // ระบุ type ที่ชัดเจน

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects`)
      .then((res) => res.json())
      .then((data: Subject[]) => setSubjects(data)) // ระบุ type ของ data
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
  useEffect(() => {
    if (!teacher) {
      setSubject("");
      return;
    }

    const filteredSubjects = subjects.filter((s) => s.teacher === teacher);

    if (filteredSubjects.length === 1) {
      setSubject(filteredSubjects[0].subject);
    } else {
      setSubject(""); // ให้ user เลือกเองถ้ามีหลายวิชา
    }
  }, [teacher, subjects]);
  return (
    <div className="p-4">
      <div className="group-button-and-text">
        <div>
          {/* group only text*/}
          <h1 className="title">
            Program SK149CNS - ฉันรักการบ้านที่ซู้ด V1.0 Build20250611
          </h1>
          <h2 className="title">Class Room EP105</h2>
        </div>
        <div className="top-right-button">
          <Link href="/" className="nav-btn">
            หน้าหลัก (Manage)
          </Link>

          <Link href="/Reports" className="nav-btn2">
            ไปหน้ารายการงาน (Task List)
          </Link>
        </div>
      </div>

      {/* ทุกอย่างในบรรทัดเดียว */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Due Date *</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="form-input date-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Teacher *</label>
          <select
            value={teacher}
            onChange={(e) => setTeacher(e.target.value)}
            className="form-select items-select"
          >
            <option value="">Select Teacher</option>
            {[...new Set(subjects.map((s) => s.teacher))].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Subject *</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="form-select items-select"
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
        </div>

        <div className="form-group">
          <label className="form-label">Work Type *</label>
          <select
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className="form-select status-select"
          >
            <option value="">เลือกประเภทงาน</option>
            <option>Group</option>
            <option>Personal</option>
            <option>School Event</option>
          </select>
        </div>
      </div>

      {/* What to finish แยกบรรทัด */}
      <div
        className="form-group"
        style={{ marginTop: "20px", marginBottom: "20px" }}
      >
        <label className="form-label">What to finish *</label>
        <textarea
          value={wtf}
          onChange={(e) => setWtf(e.target.value)}
          placeholder="What to finish"
          className="form-textarea"
          rows={9}
        />
      </div>

      <button onClick={handleSubmit} className="btn-primary mt-4">
        Add Task
      </button>
    </div>
  );
}
