"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Task, GroupedTasks } from "@/types";

export default function TaskInformation() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Set default dates on component mount
  useEffect(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    setDateFrom(today.toISOString().split("T")[0]);
    setDateTo(nextWeek.toISOString().split("T")[0]);
  }, []);

  // Fetch tasks from API
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`)
      .then((res) => res.json())
      .then((data: Task[]) => {
        setTasks(data);
        setFilteredTasks(data);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  // Handle search/filter
  const handleSearch = () => {
    if (!dateFrom || !dateTo) {
      setFilteredTasks(tasks);
      return;
    }

    const filtered = tasks.filter((task) => {
      const taskDate = new Date(task.due_date);
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      return taskDate >= fromDate && taskDate <= toDate;
    });

    setFilteredTasks(filtered);
  };

  // Format date to DD.MM.YYYY
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB").replace(/\//g, ".");
  };

  // Group tasks by date
  const groupedTasks: GroupedTasks = filteredTasks.reduce(
    (acc: GroupedTasks, task: Task) => {
      const dateKey = formatDate(task.due_date);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(task);
      return acc;
    },
    {}
  );
  const sortedEntries = Object.entries(groupedTasks).sort(([a], [b]) => {
    const dateA = new Date(a.split(".").reverse().join("-"));
    const dateB = new Date(b.split(".").reverse().join("-"));
    return dateA.getTime() - dateB.getTime(); // Use getTime() for accurate comparison
  });
  return (
    <div className="p-4">
      <h1 className="title"> Task Information</h1>

      <div className="tableClass">
        <Link href="/" className="nav-btn">
          หน้าหลัก (Manage)
        </Link>

        <Link href="/Reports" className="nav-btn2">
          ไปหน้ารายการงาน (Task List)
        </Link>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="form-input"
              />
              <span className="form-label">(Default Current Date)</span>
            </div>

            <div className="form-group">
              <label className="form-label">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="form-input"
              />
              <span className="form-label">(Default Current Date +7)</span>
            </div>
          </div>

          <button onClick={handleSearch} className="btn-primary">
            Search
          </button>
        </div>

        {/* Tasks Table */}
        <div className="card-container">
          {sortedEntries.map(([date, dateTasks]) => (
            <div key={date} className="card">
              {/* วันที่ */}
              <div className="card-header">{date}</div>

              {/* ถ้าไม่มีงานในวันนั้น */}
              {dateTasks.length === 0 ? (
                <div className="card-empty">
                  No Task Dued : Yeah!!! Very Happy.
                </div>
              ) : (
                dateTasks.map((task, index) => (
                  <div
                    key={task.sid || `${date}-${index}`}
                    className="task-item"
                  >
                    {/* หัวเรื่อง */}
                    <div className="task-header">
                      <span className="teacher-subject">
                        T. {task.teacher} : {task.subject}
                      </span>
                      <span className="task-type">{task.work_type}</span>
                    </div>

                    {/* รายละเอียด */}
                    <div className="task-body">
                      <strong>{index + 1}. </strong>
                      {task.wtf}
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
