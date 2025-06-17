"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Task, GroupedTasks } from "@/types";
import "./reports.css";

export default function TaskInformation() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});
  const [fullCalendarMode, setFullCalendarMode] = useState(false);

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setDateFrom(todayStr);
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`)
      .then((res) => res.json())
      .then((data: Task[]) => {
        setTasks(data);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  useEffect(() => {
    if (dateFrom && tasks.length > 0) {
      updateGroupedTasks();
    }
  }, [dateFrom, tasks]);
  useEffect(() => {
    const user = localStorage.getItem("adminName");
    const logAccess = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/log-access`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            menu: "Work on Due Report", // แก้ชื่อเมนูให้ตรงแต่ละหน้า
            user: user ?? "", // ส่งค่าว่าง ถ้าไม่มีชื่อ
            date_time: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("Failed to log access:", err);
      }
    };

    logAccess();
  }, []);
  const updateGroupedTasks = () => {
    const fromDate = new Date(dateFrom);
    fromDate.setHours(0, 0, 0, 0);

    const maxTaskDate = tasks.reduce((max, task) => {
      const taskDate = new Date(task.due_date);
      return taskDate > max ? taskDate : max;
    }, new Date(fromDate));

    maxTaskDate.setHours(23, 59, 59, 999);

    const filtered = tasks.filter((task) => {
      const taskDate = new Date(task.due_date);
      return taskDate >= fromDate && taskDate <= maxTaskDate;
    });

    const grouped = groupTasksByDate(filtered);
    setGroupedTasks(grouped);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB").replace(/\//g, ".");
  };

  const groupTasksByDate = (tasksToGroup: Task[]): GroupedTasks => {
    return tasksToGroup.reduce((acc: GroupedTasks, task: Task) => {
      const dateKey = formatDate(task.due_date);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
      return acc;
    }, {});
  };

  const getSortedEntries = () => {
    const fromDate = new Date(dateFrom);
    const today = new Date(fromDate);
    today.setHours(0, 0, 0, 0);

    const toDate = new Date(
      tasks.reduce((max, task) => {
        const date = new Date(task.due_date);
        return date > max ? date : max;
      }, new Date(today))
    );
    toDate.setHours(0, 0, 0, 0);

    const entries: [string, Task[]][] = [];
    const currentDate = new Date(today);

    while (currentDate <= toDate) {
      const key = currentDate.toLocaleDateString("en-GB").replace(/\//g, ".");
      entries.push([key, groupedTasks[key] || []]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return entries;
  };

  const sortedEntries = fullCalendarMode
    ? getSortedEntries()
    : Object.entries(groupedTasks).sort(([a], [b]) => {
        const dateA = new Date(a.split(".").reverse().join("-"));
        const dateB = new Date(b.split(".").reverse().join("-"));
        return dateA.getTime() - dateB.getTime();
      });

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
          <Link href="/Logins" className="nav-btn">
            Manage Due
          </Link>
          <Link href="/" className="nav-btn2">
            Work on Due Report
          </Link>
        </div>
      </div>

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

        <div className="card-container">
          {sortedEntries.map(([date, dateTasks]) => {
            try {
              const [day, month, year] = date.split(".").map(Number);
              const dateObj = new Date(year, month - 1, day);
              if (isNaN(dateObj.getTime())) throw new Error("Invalid Date");

              const weekday = new Intl.DateTimeFormat("en-US", {
                weekday: "short",
              }).format(dateObj);

              let homeworkCounter = 0;

              return (
                <div key={date} className="card">
                  <div className="card-header">
                    {date} <span className="weekday">{weekday}</span>
                  </div>

                  {dateTasks.length === 0 ? (
                    <div className="card-empty">
                      No Task Dued: Yeah!!! Very Happy
                    </div>
                  ) : (
                    <div className="task-day">
                      {dateTasks.map((task, index) => {
                        const isHomework =
                          task.work_type === "Group" ||
                          task.work_type === "Personal";
                        if (isHomework) homeworkCounter++;

                        return (
                          <div
                            key={task.sid || `${date}-${index}`}
                            className={`task-item ${
                              task.work_type === "School Event"
                                ? "school-event"
                                : task.work_type === "School Exam"
                                ? "school-exam"
                                : ""
                            }`}
                          >
                            <div className="task-header">
                              {/* แสดงตัวเลขเฉพาะ Group และ Personal */}
                              {(task.work_type === "Group" ||
                                task.work_type === "Personal") && (
                                <strong>{homeworkCounter}. </strong>
                              )}

                              {/* แสดงครูและวิชา ยกเว้น School Event/Exam */}
                              {task.work_type !== "School Event" &&
                                task.work_type !== "School Exam" && (
                                  <span className="teacher-subject">
                                    {task.teacher} : {task.subject}
                                  </span>
                                )}

                              {/* แสดงประเภทงานทั้งหมด */}
                              <span className="task-type">
                                {task.work_type}
                              </span>
                            </div>
                            <div className="task-body">{task.wtf}</div>

                            <div className="task-creator">
                              <span className="creator-label">by :</span>
                              <span className="creator-name">
                                {task.created_by_name || "Unknown"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } catch (err) {
              console.error("Skipping invalid date:", date);
              return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
