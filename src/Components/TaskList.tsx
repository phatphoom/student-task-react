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
  <div className={"tableWrapperClass"}>
    <table className={"tableClass"}>
      <thead className={"theadClass"}>
        <tr>
          <th className={"thClass"}>Due Date</th>
          <th className={"thClass"}>Subject</th>
          <th className={"thClass"}>Teacher</th>
          <th className={"thClass"}>What to Finish</th>
          <th className={"thClass"}>Type</th>
          <th className={"thClass"}>Actions</th>
        </tr>
      </thead>
      <tbody className={'tbodyClass'}>
        {tasks.map((t) => (
          <tr key={t.sid} className={'rowHoverClass'}>
            <td className={'tdClass'}>
              {editingId === t.sid ? (
                <input
                  type="date"
                  value={editData.due_date}
                  onChange={(e) =>
                    setEditData({ ...editData, due_date: e.target.value })
                  }
                  className={'inputClass'}
                />
              ) : (
                new Date(t.due_date).toLocaleDateString()
              )}
            </td>
            <td className={'tdClass'}>
              {editingId === t.sid ? (
                <input
                  type="text"
                  value={editData.subject}
                  onChange={(e) =>
                    setEditData({ ...editData, subject: e.target.value })
                  }
                  className={'inputClass'}
                  placeholder="Subject"
                />
              ) : (
                t.subject
              )}
            </td>
            <td className={'tdClass'}>
              {editingId === t.sid ? (
                <input
                  type="text"
                  value={editData.teacher}
                  onChange={(e) =>
                    setEditData({ ...editData, teacher: e.target.value })
                  }
                  className={'inputClass'}
                  placeholder="Teacher"
                />
              ) : (
                t.teacher
              )}
            </td>
            <td className={'tdClass'}>
              {editingId === t.sid ? (
                <textarea
                  value={editData.wtf}
                  onChange={(e) =>
                    setEditData({ ...editData, wtf: e.target.value })
                  }
                  className={`${'inputClass'} resize-none`}
                  rows={2}
                  placeholder="What to Finish"
                />
              ) : (
                t.wtf
              )}
            </td>
            <td className={'tdClass'}>
              {editingId === t.sid ? (
                <select
                  value={editData.work_type}
                  onChange={(e) =>
                    setEditData({ ...editData, work_type: e.target.value })
                  }
                  className={'inputClass'}
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
            <td className={'tdClass'}>
              {editingId === t.sid ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(t.sid)}
                    className={'buttonSaveClass'}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className={'buttonCancelClass'}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(t)}
                    className={`${'editButtonClass'} ${'actionButtonClass'}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(t.sid)}
                    className={`${'deleteButtonClass'} ${'actionButtonClass'}`}
                  >
                    Delete
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

  );
}
