"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Task, GroupedTasks } from "@/types";
import "./reports.css";

export default function TaskInformation() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  useEffect(() => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const todayStr = today.toISOString().split("T")[0];
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    setDateFrom(todayStr);
    setDateTo(nextWeekStr);
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`)
      .then((res) => res.json())
      .then((data: Task[]) => {
        setTasks(data);

        // filter เฉพาะตั้งแต่วันนี้ไว้เป็น default
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureTasks = data.filter((task) => {
          const taskDate = new Date(task.due_date);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate >= today;
        });

        setFilteredTasks(futureTasks);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  const handleSearch = () => {
    if (isFiltered) {
      setFilteredTasks(tasks);
      setIsFiltered(false);
    } else {
      if (!dateFrom || !dateTo) {
        setFilteredTasks(tasks);
        setIsFiltered(false);
        return;
      }

      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);

      const filtered = tasks.filter((task) => {
        const taskDate = new Date(task.due_date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate >= fromDate && taskDate <= toDate;
      });

      setFilteredTasks(filtered);
      setIsFiltered(true);
    }
    setIsSearch(!isSearch);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB").replace(/\//g, ".");
  };

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const filteredTodayOrFuture = filteredTasks.filter((task) => {
    const taskDate = new Date(task.due_date);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate >= todayDate;
  });

  const groupedTasks: GroupedTasks = filteredTodayOrFuture.reduce(
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
  const generateDateRange = (start: Date, days: number): string[] => {
    const dates: string[] = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);

    for (let i = 0; i <= days; i++) {
      const dateStr = current.toLocaleDateString("en-GB").replace(/\//g, ".");
      dates.push(dateStr);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysLater = new Date(today);
  sevenDaysLater.setDate(today.getDate() + 7);

  const fullDates = generateDateRange(today, 7);

  const filledGroupedTasks: GroupedTasks = {};
  fullDates.forEach((dateKey) => {
    filledGroupedTasks[dateKey] = groupedTasks[dateKey] || [];
  });

  // เรียงวันให้ถูก
  const sortedEntries = Object.entries(filledGroupedTasks).sort(([a], [b]) => {
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
          <Link href="/" className="nav-btn">
            Manage Due
          </Link>
          <Link href="/Reports" className="nav-btn2">
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

            <div className="form-group2">
              <label className="form-label2">Date To : </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button onClick={handleSearch} className="btn-primary">
            {!isSearch ? "Search by Date" : "Show All"}
          </button>
        </div>

        <div className="card-container">
          {sortedEntries.map(([date, dateTasks]) => {
            const [day, month, year] = date.split(".").map(Number);
            const dateObj = new Date(year, month - 1, day);
            const weekday = new Intl.DateTimeFormat("en-US", {
              weekday: "short",
            }).format(dateObj);

            return (
              <div key={date} className="card">
                <div className="card-header">
                  {date} <span className="weekday">{weekday}</span>
                </div>

                {dateTasks.length === 0 ? (
                  <div className="card-empty">No Task Dued: Yeah!!! Very Happy</div>
                ) : (
                  dateTasks.map((task, index) => (
                    <div
                      key={task.sid || `${date}-${index}`}
                      className="task-item"
                    >
                      <div className="task-header">
                        <strong>{index + 1}. </strong>
                        <span className="teacher-subject">
                          T. {task.teacher} : {task.subject}
                        </span>
                        <span className="task-type">{task.work_type}</span>
                      </div>
                      <div className="task-body">{task.wtf}</div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
