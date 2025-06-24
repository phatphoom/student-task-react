"use client";
import { useEffect, useState } from "react";
import { Task, EditData, Note } from "@/types";
import "./tasklist.css";

export default function TaskList({
  refreshTrigger,
  startDate,
}: {
  refreshTrigger: boolean;
  startDate: string; // YYYY‑MM‑DD
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<EditData>({
    due_date: "",
    subject: "",
    teacher: "",
    wtf: "",
    work_type: "",
    created_by: "",
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [note, setNote] = useState("");
  const [yourName, setYourName] = useState("");
  const [error, setError] = useState("");
  const [taskNoteCounts, setTaskNoteCounts] = useState<{
    [key: number]: number;
  }>({});

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
      console.log(filtered)
      setTasks(filtered);
      loadTaskNoteCounts(filtered);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const loadTaskNoteCounts = async (tasksData: Task[]) => {
    const counts: { [key: number]: number } = {};

    for (const task of tasksData) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${task.task_id}`
        );
        const noteData = await res.json();
        counts[task.task_id] = Array.isArray(noteData) ? noteData.length : 0;
      } catch (err) {
        console.error(`Error loading notes for task ${task.task_id}:`, err);
        counts[task.task_id] = 0;
      }
    }

    setTaskNoteCounts(counts);
  };

  const handleEdit = (task: Task) => {
    setEditingId(`${task.sid}-${task.task_id}`);
    setEditData({
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
      subject: task.subject || "",
      teacher: task.teacher || "",
      wtf: task.wtf || "",
      work_type: task.work_type || "",
      created_by: task.created_by || "",
    });
  };

  const handleSave = async (taskId: string) => {
    try {
      let userId = null;
      try {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
          const parsed = JSON.parse(userInfo);
          userId = parsed.user_id || parsed.id;
        }
      } catch (e) {
        console.warn("Cannot access localStorage, using default user_id");
      }

      const updatedTask = {
        ...editData,
        due_date: editData.due_date ? `${editData.due_date}T00:00:00Z` : null,
        created_by: editData.created_by,
        last_updated_by: userId || editData.last_updated_by || 1,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
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

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`, {
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
      created_by: "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    resetEditData();
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

  const openNoteModal = async (task: Task) => {
    setSelectedTask(task);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${task.task_id}`
      );
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading notes:", err);
      setNotes([]);
    }
  };

  const closeNoteModal = () => {
    setSelectedTask(null);
    setNote("");
    setYourName("");
    setError("");
  };

  const handleSaveNote = async () => {
    if (!note || !yourName) {
      setError("Please enter both Note and Your Name");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            task_id: selectedTask?.task_id,
            note: note,
            note_by: yourName,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to save note");

      const newNotes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${selectedTask?.task_id}`
      ).then((res) => res.json());

      setNotes(newNotes);
      setNote("");
      setYourName("");
      setError("");

      if (selectedTask) {
        setTaskNoteCounts((prev) => ({
          ...prev,
          [selectedTask.task_id]: Array.isArray(newNotes) ? newNotes.length : 0,
        }));
      }
    } catch (err) {
      setError("Failed to save note. Please try again.");
      console.error("Save note error:", err);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    const confirmed = confirm("Are you sure you want to delete this note?");
    if (!confirmed) return;
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${noteId}`, {
        method: "DELETE",
      });
  
      if (res.ok) {
        // อัพเดท state notes โดยตรง
        setNotes(prevNotes => prevNotes.filter(note => note.note_id !== noteId));
        
        // อัพเดทจำนวนโน็ตใน taskNoteCounts
        if (selectedTask) {
          setTaskNoteCounts(prev => ({
            ...prev,
            [selectedTask.task_id]: prev[selectedTask.task_id] - 1
          }));
        }
        
        alert("Note deleted successfully.");
      } else {
        const err = await res.json();
        console.error("Delete failed:", err);
        alert("Failed to delete note.");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Error deleting note.");
    }
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
                const isHomework =
                  t.work_type === "Group" || t.work_type === "Personal";
                if (isHomework) homeworkCounter++;

                return (
                  <div
                    key={`${t.sid}-${t.task_id}`}
                    className={`taskCard ${
                      t.work_type === "School Event"
                        ? "school-event-task"
                        : t.work_type === "School Exam"
                        ? "school-exam-task"
                        : ""
                    }`}
                    data-work-type={t.work_type}
                  >
                    {editingId === `${t.sid}-${t.task_id}` ? (
                      <div className="editForm">
                        <EditForm
                          editData={editData}
                          setEditData={setEditData}
                          handleSave={() => handleSave(String(t.task_id))}
                          handleCancel={handleCancel}
                        />
                      </div>
                    ) : (
                      <>
                         <div className="taskHeader">
                          {isHomework && <span>{homeworkCounter}. </span>}
                          {t.work_type !== "School Event" &&
                            t.work_type !== "School Exam" && (
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
                          className="open-note-btn"
                          onClick={() => openNoteModal(t)}
                        >
                          📝
                          {taskNoteCounts[t.task_id] > 0 && (
                            <span className="note-count">({taskNoteCounts[t.task_id]})</span>
                          )}
                           </button>

                          <button
                            onClick={() => handleEdit(t)}
                            className="editBtn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(String(t.task_id))}
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

      {/* Note Modal */}
      {selectedTask && (
        <div className="modal-overlay" onClick={closeNoteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <strong>
                {selectedTask.teacher} : {selectedTask.subject}
              </strong>
              <span className="typeTag">{selectedTask.work_type}</span>
              <button onClick={closeNoteModal} className="modal-close">
                ✖
              </button>
            </div>

            <div className="modal-body">
              <div className="existing-notes">
                {notes.length > 0 ? (
                  notes.map((item, index) => (
                    <div key={index} className="note-item">
                      <div className="note-header">
                        <strong>
                          Note {index + 1} : by {item.note_by}
                        </strong>{" "}
                        <span className="note-date">
                          {new Date(item.note_date).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                        <button
                          onClick={() => handleDeleteNote(item.note_id)}
                          className="delete-note-btn"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="note-body">
                        {item.note.split("\n").map((line, idx) => (
                          <span key={idx}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="note-item">No notes available</div>
                )}
              </div>

              <div className="note-title">Add your Note:</div>
              <textarea
                placeholder="Add your note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="modal-note"
              />
              <input
                type="text"
                placeholder="Your Name *"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                className="modal-name-input"
              />
              {error && <div className="error-message">{error}</div>}
            </div>

            <div className="modal-footer">
              <button onClick={handleSaveNote} className="editBtn">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
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