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
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <label className="form-label">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="form-input"
              />
              <span className="form-label">(Default Current Date)</span>
            </div>

            <hr />

            <div className="flex items-center gap-2">
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
        <div className="tableClass">
          <table className="tableWrapperClass">
            <thead>
              <tr className="theadClass">
                <th className="theadClass">Due Date</th>
                <th className="theadClass">Subject</th>
                <th className="theadClass">Teacher</th>
                <th className="theadClass">What to Finish</th>
                <th className="theadClass">Type</th>
              </tr>
            </thead>
            <tbody>
              {sortedEntries.map(([date, dateTasks]) =>
                dateTasks.map((task, index) => (
                  <tr key={task.sid || `${date}-${index}`} className="tdClass">
                    <td className="tdClass">{index === 0 ? date : ""}</td>
                    <td className="tdClass">{task.subject}</td>
                    <td className="tdClass">{task.teacher}</td>
                    <td className="tdClass">
                      <div className="tdClass">
                        <span className="tdClass">
                          {dateTasks.indexOf(task) + 1}.
                        </span>
                        <span>{task.wtf}</span>
                      </div>
                    </td>
                    <td className="tdClass">
                      <span
                        className={`tdClass ${
                          task.work_type === "Group" ? "tdClass" : "tdClass"
                        }`}
                      >
                        {task.work_type}
                      </span>
                    </td>
                  </tr>
                ))
              )}

              {/* Empty rows for styling */}
              {filteredTasks.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-gray-300 px-4 py-8 text-center text-gray-500"
                  >
                    No tasks found for the selected date range
                  </td>
                </tr>
              )}

              {/* Add some empty rows to match the original design */}
              {Array.from({
                length: Math.max(0, 8 - filteredTasks.length),
              }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td className="tbodyClass">&nbsp;</td>
                  <td className="tbodyClass">&nbsp;</td>
                  <td className="tbodyClass">&nbsp;</td>
                  <td className="tbodyClass">&nbsp;</td>
                  <td className="tbodyClass">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
