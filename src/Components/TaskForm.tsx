"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Subject } from "@/types";

export default function TaskForm({
  onTaskAdded,
  onDateChange,
}: {
  onTaskAdded: () => void;
  onDateChange: (date: string) => void;
}) {
  const [dueDate, setDueDate] = useState<string>("");
  const [teacher, setTeacher] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [workType, setWorkType] = useState<string>("Personal");
  const [wtf, setWtf] = useState<string>("");
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects`)
      .then((res) => res.json())
      .then((data: Subject[]) => setSubjects(data))
      .catch((err) => console.error("Error loading subjects:", err));
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDueDate(today);
    onDateChange(today);
  }, [onDateChange]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setDueDate(date);
    onDateChange(date);
  };

  const handleSubmit = async () => {
    let finalDueDate = dueDate;

    if (workType === "School Event" || workType === "School Exam") {
      if (!wtf) {
        alert("Please fill in What to Finish.");
        return;
      }
    } else {
      if (!dueDate || !teacher || !subject || !wtf) {
        alert("Please fill in all required fields.");
        return;
      }
    }

    const adminUsername = localStorage.getItem("adminName");

    const body = {
      task_id: "TASK_" + Date.now(),
      due_date: new Date(finalDueDate).toISOString(),
      teacher: workType === "School Event" ? "" : teacher,
      subject: workType === "School Event" ? "" : subject,
      wtf,
      work_type: workType,
      created_by: adminUsername || null,
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
      await fetchTasks();
      onTaskAdded();
      // Reset form
      const todayStr = new Date().toISOString().split("T")[0];
      setDueDate(todayStr);
      setWtf("");
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
      setSubject("");
    }
  }, [teacher, subjects]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="group-button-and-text">
        <div>
          <h1 className="title">
            Program SK149CNS - ฉันรักการบ้านที่ซู้ด V1.0 Build20250611
          </h1>
          <h2 className="title">Class Room EP105</h2>
        </div>
        <div className="top-right-button">
          {/* <Link href="/room-announcement" className="nav-btn3">
            Room Announcement
          </Link> */}
          <Link href="/Manages" className="nav-btn">
            Manage Due
          </Link>
          <Link href="/" className="nav-btn2">
            Work on Due Report
          </Link>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Due Date *</label>
          <input
            type="date"
            value={dueDate}
            onChange={handleDateChange}
            className="form-input date-input"
          />
        </div>
        {workType !== "School Event" && workType !== "School Exam" && (
          <>
            <div className="form-group">
              <label className="form-label">Teacher *</label>
              <select
                value={teacher}
                onChange={(e) => {
                  setTeacher(e.target.value);
                  const teacherSubjects = subjects.filter(
                    (s) => s.teacher === e.target.value
                  );
                  if (teacherSubjects.length === 1) {
                    setSubject(teacherSubjects[0].subject);
                  } else if (teacherSubjects.length === 0) {
                    setSubject("");
                  }
                }}
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
                onChange={(e) => {
                  setSubject(e.target.value);
                  const selectedSubject = subjects.find(
                    (s) => s.subject === e.target.value
                  );
                  if (selectedSubject) {
                    setTeacher(selectedSubject.teacher);
                  } else {
                    setTeacher("");
                  }
                }}
                className="form-select items-select"
              >
                <option value="">Select Subject</option>
                {[...new Set(subjects.map((s) => s.subject))].map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="form-group">
          <label className="form-label">Work Type *</label>
          <select
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className="form-select status-select"
          >
            <option>Group</option>
            <option>Personal</option>
            <option>School Event</option>
            <option>School Exam</option>
          </select>
        </div>
      </div>

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
