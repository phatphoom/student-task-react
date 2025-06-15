"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Task, GroupedTasks } from "@/types";
import "./reports.css";

export default function TaskInformation() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});

  // Set default dateFrom to today on first load
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setDateFrom(todayStr);
  }, []);

  // Load all tasks from API
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`)
      .then((res) => res.json())
      .then((data: Task[]) => {
        setTasks(data);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  // Update grouped tasks when dateFrom or tasks change
  useEffect(() => {
    if (dateFrom && tasks.length > 0) {
      updateGroupedTasks();
    }
  }, [dateFrom, tasks]);

  const updateGroupedTasks = () => {
    const fromDate = new Date(dateFrom);
    fromDate.setHours(0, 0, 0, 0);

    // Find max date from all tasks
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

  // Utility: convert date string to display format
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB").replace(/\//g, ".");
  };

  // Group tasks by date string
  const groupTasksByDate = (tasksToGroup: Task[]): GroupedTasks => {
    return tasksToGroup.reduce((acc: GroupedTasks, task: Task) => {
      const dateKey = formatDate(task.due_date);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
      return acc;
    }, {});
  };

  // Sort entries ascending
  const sortedEntries = Object.entries(groupedTasks).sort(([a], [b]) => {
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
                    dateTasks.map((task, index) => (
                      <div
                        key={task.sid || `${date}-${index}`}
                        className={`task-item ${
                          task.work_type === "School Event"
                            ? "school-event"
                            : ""
                        }`}
                      >
                        <div className="task-header">
                          <strong>{index + 1}. </strong>
                          <span className="teacher-subject">
                            {task.teacher} : {task.subject}
                          </span>
                          <span className="task-type">{task.work_type}</span>
                        </div>
                        <div className="task-body">{task.wtf}</div>

                        <div className="task-creator">
                          <span className="creator-label">by :</span>
                          <span className="creator-name">
                            {task.created_by_name || "Unknown"}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            } catch (err) {
              console.error("Skipping invalid date:", date);
              return null; // skip render
            }
          })}
        </div>
      </div>
    </div>
  );
}