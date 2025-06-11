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
      console.log("Saving task with ID:", id);
      console.log("Data being sent:", editData);

      // แปลง date format ให้เป็น datetime
      const dataToSend = {
        ...editData,
        due_date: editData.due_date ? `${editData.due_date}T00:00:00Z` : null,
      };

      console.log("Formatted data:", dataToSend);

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

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Success:", result);
        setEditingId(null);
        setEditData({
          due_date: "",
          subject: "",
          teacher: "",
          wtf: "",
          work_type: "",
        });
        fetchTasks(); // รีเฟรชข้อมูล
      } else {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        alert(`Failed to update task: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Network error:", error);
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
        fetchTasks(); // รีเฟรชข้อมูลแทน reload
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
              <div className="taskHeader">
                <span>{index + 1}. </span>
                {editingId === t.sid ? (
                  <>
                    <input
                      value={editData.teacher}
                      onChange={(e) =>
                        setEditData({ ...editData, teacher: e.target.value })
                      }
                      placeholder="Teacher"
                      className="inputEdit"
                    />
                    :
                    <input
                      value={editData.subject}
                      onChange={(e) =>
                        setEditData({ ...editData, subject: e.target.value })
                      }
                      placeholder="Subject"
                      className="inputEdit"
                    />
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
                  </>
                ) : (
                  <>
                    <strong>
                      T. {t.teacher} : {t.subject}
                    </strong>
                    <span className="typeTag">{t.work_type}</span>
                  </>
                )}
              </div>

              <div className="taskBody">
                {editingId === t.sid ? (
                  <textarea
                    value={editData.wtf}
                    onChange={(e) =>
                      setEditData({ ...editData, wtf: e.target.value })
                    }
                    rows={2}
                    className="inputEdit"
                  />
                ) : (
                  t.wtf
                )}
              </div>

              <div className="taskActions">
                {editingId === t.sid ? (
                  <>
                    <button
                      onClick={() => handleSave(t.sid)}
                      className="editBtn"
                    >
                      Save
                    </button>
                    <button onClick={handleCancel} className="deleteBtn">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(t)} className="editBtn">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.sid)}
                      className="deleteBtn"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
