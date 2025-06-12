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
      .then((data: Task[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingTasks = data.filter((task) => {
          const taskDate = new Date(task.due_date);
          return taskDate >= today;
        });

        setTasks(upcomingTasks);
      })
      .catch((err) => console.error("Error fetching tasks:", err));
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.sid);
    setEditData({
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
      subject: task.subject || "",
      teacher: task.teacher || "",
      wtf: task.wtf || "",
      work_type: task.work_type || "",
    });
  };

  const handleSave = async (id: number) => {
    try {
      const updatedTask = {
        ...editData,
        due_date: editData.due_date ? `${editData.due_date}T00:00:00Z` : null,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTask),
        }
      );

      if (res.ok) {
        setEditingId(null);
        resetEditData();
        fetchTasks();
      } else {
        const err = await res.json();
        console.error("Failed to update:", err);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}`, {
        method: "DELETE",
      });
      fetchTasks();
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const resetEditData = () => {
    setEditData({
      due_date: "",
      subject: "",
      teacher: "",
      wtf: "",
      work_type: "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    resetEditData();
  };

  const groupAndSortTasks = () => {
    const grouped = tasks.reduce<Record<string, Task[]>>((acc, task) => {
      const dateStr = new Date(task.due_date).toLocaleDateString("en-GB");
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(task);
      return acc;
    }, {});

    return Object.entries(grouped).sort(([a], [b]) => {
      const dateA = new Date(a.split("/").reverse().join("-"));
      const dateB = new Date(b.split("/").reverse().join("-"));
      return dateA.getTime() - dateB.getTime();
    });
  };

  return (
    <div className="cardContainer">
        {groupAndSortTasks().map(([date, tasks]) => {
          let [day, month, year] = date.split("/").map(Number);

          // ถ้าเจอปีเกิน 2500 (น่าจะเป็น พ.ศ.) ให้แปลงเป็น ค.ศ.
          if (year > 2500) {
            year -= 543;
          }

          const dateObj = new Date(year, month - 1, day);
          const weekday = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
          }).format(dateObj);

        return (
          <div key={date} className="dateCard">
            <div className="dateHeader">
              {date} <span className="weekday">{weekday}</span>
            </div>

            {tasks.map((t, index) => (
              <div
                key={t.sid}
                className={`taskCard ${
                  t.work_type === "School Event" ? "school-event-task" : ""
                }`}
                data-work-type={t.work_type}
              >
                {editingId === t.sid ? (
                  <div className="editForm">
                    <EditForm
                      editData={editData}
                      setEditData={setEditData}
                      handleSave={() => handleSave(t.sid)}
                      handleCancel={handleCancel}
                    />
                  </div>
                ) : (
                  <>
                    <div className="taskHeader">
                      <span>{index + 1}. </span>
                      {t.work_type !== "school event" &&
                        t.teacher &&
                        t.subject && (
                          <strong>
                            {t.teacher} : {t.subject}
                          </strong>
                        )}
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
        );
      })}
    </div>
  );
}

function EditForm({ editData, setEditData, handleSave, handleCancel }: any) {
  return (
    <>
      <div className="editFormField">
        <label>Teacher:</label>
        <input
          value={editData.teacher}
          onChange={(e) =>
            setEditData((prev: any) => ({ ...prev, teacher: e.target.value }))
          }
          className="inputEdit"
        />
      </div>
      <div className="editFormField">
        <label>Subject:</label>
        <input
          value={editData.subject}
          onChange={(e) =>
            setEditData((prev: any) => ({ ...prev, subject: e.target.value }))
          }
          className="inputEdit"
        />
      </div>
      <div className="editFormField">
        <label>Type:</label>
        <select
          value={editData.work_type}
          onChange={(e) =>
            setEditData((prev: any) => ({ ...prev, work_type: e.target.value }))
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
            setEditData((prev: any) => ({ ...prev, wtf: e.target.value }))
          }
          rows={3}
          className="inputEdit"
        />
      </div>
      <div className="taskActions">
        <button onClick={handleSave} className="editBtn">
          Save
        </button>
        <button onClick={handleCancel} className="deleteBtn">
          Cancel
        </button>
      </div>
    </>
  );
}
