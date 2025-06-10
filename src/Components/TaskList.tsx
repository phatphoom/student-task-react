"use client";
import { useEffect, useState } from "react";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    fetch("http://localhost:8080/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  };

  const handleEdit = (task) => {
    setEditingId(task.sid);
    setEditData({
      due_date: task.due_date ? task.due_date.split("T")[0] : "", // Format date for input
      subject: task.subject || "",
      teacher: task.teacher || "",
      wtf: task.wtf || "",
      work_type: task.work_type || "",
    });
  };

  const handleSave = async (id) => {
    try {
      console.log("Saving task with ID:", id);
      console.log("Data being sent:", editData);

      // แปลง date format ให้เป็น datetime
      const dataToSend = {
        ...editData,
        due_date: editData.due_date ? `${editData.due_date}T00:00:00Z` : null,
      };

      console.log("Formatted data:", dataToSend);

      const response = await fetch(`http://localhost:8080/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Success:", result);
        setEditingId(null);
        setEditData({});
        fetchTasks(); // รีเฟรชข้อมูล
      } else {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        alert(`Failed to update task: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert(`Network error: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await fetch(`http://localhost:8080/api/tasks/${id}`, {
          method: "DELETE",
        });
        fetchTasks(); // รีเฟรชข้อมูลแทน reload
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Error deleting task");
      }
    }
  };

  return (
    <div className="p-4">
      <table className="border w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Due Date</th>
            <th className="border p-2">Subject</th>
            <th className="border p-2">Teacher</th>
            <th className="border p-2">What to Finish</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.sid}>
              <td className="border p-2">
                {editingId === t.sid ? (
                  <input
                    type="date"
                    value={editData.due_date}
                    onChange={(e) =>
                      setEditData({ ...editData, due_date: e.target.value })
                    }
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  new Date(t.due_date).toLocaleDateString()
                )}
              </td>
              <td className="border p-2">
                {editingId === t.sid ? (
                  <input
                    type="text"
                    value={editData.subject}
                    onChange={(e) =>
                      setEditData({ ...editData, subject: e.target.value })
                    }
                    className="w-full p-1 border rounded"
                    placeholder="Subject"
                  />
                ) : (
                  t.subject
                )}
              </td>
              <td className="border p-2">
                {editingId === t.sid ? (
                  <input
                    type="text"
                    value={editData.teacher}
                    onChange={(e) =>
                      setEditData({ ...editData, teacher: e.target.value })
                    }
                    className="w-full p-1 border rounded"
                    placeholder="Teacher"
                  />
                ) : (
                  t.teacher
                )}
              </td>
              <td className="border p-2">
                {editingId === t.sid ? (
                  <textarea
                    value={editData.wtf}
                    onChange={(e) =>
                      setEditData({ ...editData, wtf: e.target.value })
                    }
                    className="w-full p-1 border rounded resize-none"
                    rows="2"
                    placeholder="What to Finish"
                  />
                ) : (
                  t.wtf
                )}
              </td>
              <td className="border p-2">
                {editingId === t.sid ? (
                  <select
                    value={editData.work_type}
                    onChange={(e) =>
                      setEditData({ ...editData, work_type: e.target.value })
                    }
                    className="w-full p-1 border rounded"
                  >
                    <option value="">Select Type</option>
                    <option value="Group">Group</option>
                    <option value="Personal">Personal</option>
                    <option value="School Event">School Event</option>
                  </select>
                ) : (
                  t.work_type
                )}
              </td>
              <td className="border p-2">
                {editingId === t.sid ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSave(t.sid)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    {" | "}
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(t.sid)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
