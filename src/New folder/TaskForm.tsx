"use client";
import { useEffect, useState } from "react";

export default function TaskForm() {
  const [dueDate, setDueDate] = useState("");
  const [teacher, setTeacher] = useState("");
  const [subject, setSubject] = useState("");
  const [workType, setWorkType] = useState("Group");
  const [wtf, setWtf] = useState("");
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/subjects")
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
      const res = await fetch("http://localhost:8080/api/tasks", {
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
    } catch (error) {
      alert("Network error");
    }
  };

  return (
    <div className="p-4">
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="border p-2 mb-2 w-full"
      />

      <select
        value={teacher}
        onChange={(e) => setTeacher(e.target.value)}
        className="border p-2 mb-2 w-full"
      >
        <option value="">Select Teacher</option>
        {[...new Set(subjects.map((s) => s.teacher))].map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="border p-2 mb-2 w-full"
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

      <select
        value={workType}
        onChange={(e) => setWorkType(e.target.value)}
        className="border p-2 mb-2 w-full"
      >
        <option>Group</option>
        <option>Personal</option>
        <option>School Event</option>
      </select>

      <textarea
        value={wtf}
        onChange={(e) => setWtf(e.target.value)}
        placeholder="What to finish"
        className="border p-2 mb-2 w-full"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2"
      >
        Add Task
      </button>
    </div>
  );
}
