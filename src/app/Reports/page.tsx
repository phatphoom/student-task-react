"use client";
import { useEffect, useState } from "react";

export default function TaskInformation() {
  const [tasks, setTasks] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filteredTasks, setFilteredTasks] = useState([]);

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
    fetch("http://localhost:8080/api/tasks")
      .then((res) => res.json())
      .then((data) => {
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
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB").replace(/\//g, ".");
  };

  // Group tasks by date
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const dateKey = formatDate(task.due_date);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {});

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-xl font-bold mb-6">105 For Task Information</h1>

        {/* Date Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <label className="font-medium">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1"
              />
              <span className="text-sm text-gray-500">
                (Default Current Date)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-medium">Date From</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1"
              />
              <span className="text-sm text-gray-500">
                (Default Current Date +7)
              </span>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-medium"
          >
            Search
          </button>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-medium">
                  Due Date
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-medium">
                  Subject
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-medium">
                  Teacher
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-medium w-1/2">
                  What to Finish
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left font-medium">
                  Type
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedTasks).map(([date, dateTasks]) =>
                dateTasks.map((task, index) => (
                  <tr
                    key={task.sid || `${date}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="border border-gray-300 px-4 py-3">
                      {index === 0 ? date : ""}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      {task.subject}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      {task.teacher}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <div className="flex items-start">
                        <span className="mr-2 font-medium">
                          {dateTasks.indexOf(task) + 1}.
                        </span>
                        <span>{task.wtf}</span>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          task.work_type === "Group"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
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
                    colSpan="5"
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
                  <td className="border border-gray-300 px-4 py-3">&nbsp;</td>
                  <td className="border border-gray-300 px-4 py-3">&nbsp;</td>
                  <td className="border border-gray-300 px-4 py-3">&nbsp;</td>
                  <td className="border border-gray-300 px-4 py-3">&nbsp;</td>
                  <td className="border border-gray-300 px-4 py-3">&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
