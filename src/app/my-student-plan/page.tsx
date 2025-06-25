//app/my-student-plan/page.tsx
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
  const [dateFrom, setDateFrom] = useState(getTodayDate()); // ใช้ฟังก์ชัน getTodayDate ถ้ามี
  const [fullCalendarMode, setFullCalendarMode] = useState(false);
  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  }


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
      <div className="group-button-and-text">
        <div>
          <h1 className="title">
            Program SK149CNS - ฉันรักการบ้านที่ซู้ด V1.0 Build20250611
          </h1>

          <div className="flex flex-row space-x-2">
            <h2 className="title">Class Room EP105</h2>

          </div>
        </div>

        <div className="top-right-button">
          <Link href="/room-announcement" className="nav-btn3">
            Room Announcement
          </Link>
          <Link href="/Logins" className="nav-btn">
            Manage Due
          </Link>
          <Link href="/" className="nav-btn2">
            Work on Due Report
          </Link>
          <Link href="/my-student-plan" className="nav-btn">
            My Study plan
          </Link>
        </div>
      </div>

      {/* ส่วน Date From + Full Calendar Mode */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="form-row2">
            <div className="form-group2">
              <label className="form-label2">Date From : </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="form-input"
              />
              <button
                className="full-calendar-btn"
                onClick={() => setFullCalendarMode(!fullCalendarMode)}
              >
                {fullCalendarMode ? "Normal Mode" : "Full Calendar Mode"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* เนื้อหาอื่น ๆ ของ My Study Plan ต่อจากนี้ */}
    </div>
  );

}
