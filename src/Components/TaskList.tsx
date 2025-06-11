"use client";
import { useEffect, useState } from "react";
import { Task, EditData } from "@/types";
import "./tasklist.css";
export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditData>({
    due_date: "",
    subject: "",
    teacher: "",
    wtf: "",
    work_type: "",
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`)
      .then((res) => res.json())
      .then((data: Task[]) => setTasks(data));
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.sid);
    setEditData({
      due_date: task.due_date ? task.due_date.split("T")[0] : "", // Format date for input
      subject: task.subject || "",
      teacher: task.teacher || "",
      wtf: task.wtf || "",
      work_type: task.work_type || "",
    });
  };

  const handleSave = async (id: number) => {
    try {
      const dataToSend = {
        ...editData,
        due_date: editData.due_date ? `${editData.due_date}T00:00:00Z` : null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dataToSend),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setEditingId(null);
        setEditData({
          due_date: "",
          subject: "",
          teacher: "",
          wtf: "",
          work_type: "",
        });
        fetchTasks();
      } else {
        const errorData = await response.json();
        alert(`Failed to update task: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(`Network error: ${(error as Error).message}`);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({
      due_date: "",
      subject: "",
      teacher: "",
      wtf: "",
      work_type: "",
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`, {
          method: "DELETE",
        });
        fetchTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Error deleting task");
      }
    }
  };

  const groupedTasks = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const dateStr = new Date(task.due_date).toLocaleDateString("en-GB");
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(task);
    return acc;
  }, {});

  const sortedEntries = Object.entries(groupedTasks).sort(([a], [b]) => {
    const dateA = new Date(a.split("/").reverse().join("-"));
    const dateB = new Date(b.split("/").reverse().join("-"));
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="cardContainer">
      {sortedEntries.map(([date, tasks]) => (
        <div key={date} className="dateCard">
          <div className="dateHeader">{date}</div>
          {tasks.map((t, index) => (
            <div key={t.sid} className="taskCard">
              {editingId === t.sid ? (
                <div className="editForm">
                  <div className="editFormField">
                    <label>Teacher:</label>
                    <input
                      value={editData.teacher}
                      onChange={(e) =>
                        setEditData({ ...editData, teacher: e.target.value })
                      }
                      placeholder="Teacher"
                      className="inputEdit"
                    />
                  </div>
                  <div className="editFormField">
                    <label>Subject:</label>
                    <input
                      value={editData.subject}
                      onChange={(e) =>
                        setEditData({ ...editData, subject: e.target.value })
                      }
                      placeholder="Subject"
                      className="inputEdit"
                    />
                  </div>
                  <div className="editFormField">
                    <label>Type:</label>
                    <select
                      value={editData.work_type}
                      onChange={(e) =>
                        setEditData({ ...editData, work_type: e.target.value })
                      }
                      className="inputEdit"
                    >
                      <option value="">Select Type</option>
                      <option value="Group">Group</option>
                      <option value="Personal">Personal</option>
                      <option value="School Event">School Event</option>
                    </select>
                  </div>
                  <div className="editFormField">
                    <label>Description:</label>
                    <textarea
                      value={editData.wtf}
                      onChange={(e) =>
                        setEditData({ ...editData, wtf: e.target.value })
                      }
                      rows={3}
                      className="inputEdit"
                      placeholder="Description"
                    />
                  </div>
                  <div className="taskActions">
                    <button onClick={() => handleSave(t.sid)} className="editBtn">
                      Save
                    </button>
                    <button onClick={handleCancel} className="deleteBtn">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="taskHeader">
                    <span>{index + 1}. </span>
                    <strong>
                      T. {t.teacher} : {t.subject}
                    </strong>
                    <span className="typeTag">{t.work_type}</span>
                  </div>
                  <div className="taskBody">{t.wtf}</div>
                  <div className="taskActions">
                    <button onClick={() => handleEdit(t)} className="editBtn">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.sid)}
                      className="deleteBtn"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
