"use client";
import { useEffect, useState } from "react";
import { Task, EditData } from "@/types";
import "./tasklist.css";

export default function TaskList({
  refreshTrigger,
}: {
  refreshTrigger: boolean;
}) {
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

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`);
      const data: Task[] = await res.json();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcomingTasks = data.filter((task) => {
        const taskDate = new Date(task.due_date);
        return taskDate >= today;
      });
      setTasks(upcomingTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
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

  const generateDateRange = (start: Date, days: number): string[] => {
    const dates: string[] = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);

    for (let i = 0; i <= days; i++) {
      const dateStr = current.toLocaleDateString("en-GB");
      dates.push(dateStr);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const groupAndSortTasks = () => {
    const grouped: Record<string, Task[]> = {};

    // กำหนดช่วง 7 วันข้างหน้า
    const today = new Date();
    const dates = generateDateRange(today, 7);

    dates.forEach((dateStr) => {
      grouped[dateStr] = [];
    });

    tasks.forEach((task) => {
      const taskDate = new Date(task.due_date);
      const taskDateStr = taskDate.toLocaleDateString("en-GB");
      if (grouped[taskDateStr]) {
        grouped[taskDateStr].push(task);
      }
    });

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
        if (year > 2500) year -= 543;
        const dateObj = new Date(year, month - 1, day);
        const weekday = new Intl.DateTimeFormat("en-US", {
          weekday: "short",
        }).format(dateObj);

        return (
          <div key={date} className="dateCard">
            <div className="dateHeader">
              {date} <span className="weekday">{weekday}</span>
            </div>

            {tasks.length === 0 ? (
              <div className="card-empty">No Task Dued: Yeah!!! Very Happy</div>
            ) : (
              tasks.map((t, index) => (
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

                      {/* เพิ่มส่วนแสดงชื่อผู้สร้าง */}
                      <div className="taskCreator">
                        <span className="creatorLabel">by:</span>
                        <span className="creatorName">
                          {t.created_by_name || "Unknown"}
                        </span>
                      </div>

                      <div className="taskActions">
                        <button
                          onClick={() => handleEdit(t)}
                          className="editBtn"
                        >
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
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}

// EditForm (เหมือนเดิม)
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
