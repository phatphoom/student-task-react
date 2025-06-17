"use client";
import { useEffect, useState } from "react";
import { Task, EditData } from "@/types";
import "./tasklist.css";

export default function TaskList({
  refreshTrigger,
  startDate,
}: {
  refreshTrigger: boolean;
  startDate: string; // YYYY‑MM‑DD
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditData>({
    due_date: "",
    subject: "",
    teacher: "",
    wtf: "",
    work_type: "",
    created_by: "",
  });

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger, startDate]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`);
      const data: Task[] = await res.json();
      const start = startDate ? new Date(startDate) : new Date();
      start.setHours(0, 0, 0, 0);

      const filtered = data.filter((t) => {
        const td = new Date(t.due_date);
        td.setHours(0, 0, 0, 0);
        return td >= start;
      });
      setTasks(filtered);
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
      created_by: task.created_by || "",
    });
  };

  const handleSave = async (id: number) => {
    try {
      const updatedTask = {
        ...editData,
        due_date: editData.due_date ? `${editData.due_date}T00:00:00Z` : null,
        created_by: editData.created_by,
      };
      console.log(updatedTask);
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
      dates.push(current.toLocaleDateString("en-GB"));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const generateDateRangeFromTo = (start: Date, end: Date): string[] => {
    const dates: string[] = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      dates.push(current.toLocaleDateString("en-GB"));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const sortTasksInDate = (tasksOnDate: Task[]) => {
    return tasksOnDate.sort((a, b) => {
      const getPriority = (workType: string) => {
        switch (workType) {
          case "School Event":
            return 1;
          case "School Exam":
            return 2;
          case "Group":
            return 3;
          case "Personal":
            return 4;
          default:
            return 5;
        }
      };

      return getPriority(a.work_type) - getPriority(b.work_type);
    });
  };

  const groupAndSortTasks = () => {
    const grouped: Record<string, Task[]> = {};
    const start = startDate ? new Date(startDate) : new Date();

    const maxDate = tasks.reduce((max, task) => {
      const taskDate = new Date(task.due_date);
      return taskDate > max ? taskDate : max;
    }, new Date(start));

    const dates = generateDateRangeFromTo(start, maxDate);
    dates.forEach((d) => (grouped[d] = []));

    tasks.forEach((t) => {
      const td = new Date(t.due_date);
      const key = td.toLocaleDateString("en-GB");
      if (grouped[key]) grouped[key].push(t);
    });

    return Object.entries(grouped)
      .filter(([, arr]) => arr.length > 0)
      .sort(([a], [b]) => {
        const da = new Date(a.split("/").reverse().join("-"));
        const db = new Date(b.split("/").reverse().join("-"));
        return da.getTime() - db.getTime();
      });
  };

  return (
    <div className="cardContainer">
      {groupAndSortTasks().map(([date, tasksOnDate]) => {
        let [d, m, y] = date.split("/").map(Number);
        if (y > 2500) y -= 543;
        const dateObj = new Date(y, m - 1, d);
        const weekday = new Intl.DateTimeFormat("en-US", {
          weekday: "short",
        }).format(dateObj);

        const sortedTasks = sortTasksInDate(tasksOnDate);
        let homeworkCounter = 0;

        return (
          <div key={date} className="dateCard">
            <div className="dateHeader">
              {date} <span className="weekday">{weekday}</span>
            </div>

            {tasks.length === 0 ? (
              <div className="card-empty">No Task Dued: Yeah!!! Very Happy</div>
            ) : (
              sortedTasks.map((t) => {
                const isHomework = t.work_type === "Group" || t.work_type === "Personal";
                if (isHomework) homeworkCounter++;

                return (
                  <div
                    key={t.sid}
                    className={`taskCard ${
                      t.work_type === "School Event"
                        ? "school-event-task"
                        : t.work_type === "School Exam"
                        ? "school-exam-task"
                        : ""
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
                          {isHomework && <span>{homeworkCounter}. </span>}
                          {(t.work_type !== "School Event" && t.work_type !== "School Exam") && (
                            <strong>
                              {t.teacher} : {t.subject}
                            </strong>
                          )}
                          <span className="typeTag">{t.work_type}</span>
                        </div>
                        <div className="taskBody">{t.wtf}</div>

                        <div className="taskCreator">
                          <span className="creatorLabel">by :</span>
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
                );
              })
            )}
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
          <option value="School Exam">School Exam</option>
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