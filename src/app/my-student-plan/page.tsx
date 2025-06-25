"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "./mystudy.css";
import "./taskcard.css";

export default function MyStudentPlan() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentCardDate, setCurrentCardDate] = useState("");
  const [newActivity, setNewActivity] = useState({
    time: "",
    duration: "",
    description: "",
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`);
      const data = await res.json();
      
      // Sort tasks by due_date (oldest first)
      const sortedTasks = data.sort((a: any, b: any) => {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
      
      setTasks(sortedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
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

  const handleAddActivityClick = (date: string) => {
    setCurrentCardDate(date);
    setShowAddForm(true);
  };

  const handleSaveActivity = () => {
    // Should add code to save to API here
    alert(`Activity saved for ${currentCardDate}`);
    setShowAddForm(false);
    setNewActivity({ time: "", duration: "", description: "" });
  };

  const handleDiscardActivity = () => {
    setShowAddForm(false);
    setNewActivity({ time: "", duration: "", description: "" });
  };

  // Group tasks by date
  const groupedTasks = tasks.reduce((acc: Record<string, any[]>, task) => {
    const taskDate = new Date(task.due_date);
    const dateKey = taskDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(task);
    return acc;
  }, {});

  // Sort dates chronologically
  const sortedDates = Object.keys(groupedTasks).sort();

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="group-button-and-text">
        <div>
          <h1 className="title">
            Program SK149CNS - ฉันรักการบ้านที่ซู้ด V1.0 Build20250611
          </h1>
          <h2 className="title">Class Room EP105</h2>
        </div>
        <div className="top-right-button">
          <Link href="/room-announcement" className="nav-btn3">
            Room Announcement
          </Link>
          <Link href="/Manages" className="nav-btn">
            Manage Due
          </Link>
          <Link href="/" className="nav-btn2">
            Work on Due Report
          </Link>
          <Link href="/my-student-plan" className="nav-btn">
            My Study plan
          </Link>
        </div>
      </div>

      {/* Task List */}
      <div className="cardContainer">
        {tasks.length === 0 ? (
          <div className="empty-message">No tasks found</div>
        ) : (
          sortedDates.map((date) => {
            const tasksForDate = groupedTasks[date];
            const taskDate = new Date(date);
            const formattedDate = taskDate.toLocaleDateString("en-GB");
            const weekday = taskDate.toLocaleDateString("en-US", {
              weekday: "short",
            });

            return (
              <div key={date} className="dateCard">
                <div className="dateHeader">
                  {formattedDate} <span className="weekday">{weekday}</span>
                </div>

                {/* Add more activities button */}
                <button
                  className="add-activities-btn"
                  onClick={() => handleAddActivityClick(formattedDate)}
                >
                  Add more activities
                </button>

                {/* Activity form (shown only for current card) */}
                {showAddForm && currentCardDate === formattedDate && (
                  <div className="activity-form">
                    <div className="form-group">
                      <label>Time</label>
                      <input
                        type="time"
                        value={newActivity.time}
                        onChange={(e) =>
                          setNewActivity({
                            ...newActivity,
                            time: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration (Hours)</label>
                      <input
                        type="number"
                        value={newActivity.duration}
                        onChange={(e) =>
                          setNewActivity({
                            ...newActivity,
                            duration: e.target.value,
                          })
                        }
                        placeholder="Estimate duration"
                      />
                    </div>
                    <div className="form-group">
                      <label>My Note</label>
                      <textarea
                        value={newActivity.description}
                        onChange={(e) =>
                          setNewActivity({
                            ...newActivity,
                            description: e.target.value,
                          })
                        }
                        placeholder="What to do..."
                        rows={3}
                      />
                    </div>
                    <div className="form-actions">
                      <button
                        className="save-btn"
                        onClick={handleSaveActivity}
                      >
                        Save
                      </button>
                      <button
                        className="discard-btn"
                        onClick={handleDiscardActivity}
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}

                {/* Tasks for this date */}
                {tasksForDate.map((task) => (
                  <div key={task.task_id} className="taskCard" data-work-type={task.work_type}>
                    <div className="taskHeader">
                      {task.work_type !== "School Event" &&
                        task.work_type !== "School Exam" && (
                          <strong>
                            {task.teacher} : {task.subject}
                          </strong>
                        )}
                      <span className="typeTag">{task.work_type}</span>
                    </div>
                    <div className="taskBody">{task.wtf}</div>

                    <div className="taskCreator">
                      <span className="creatorLabel">by :</span>
                      <span className="creatorName">
                        {task.created_by || "Unknown"}
                      </span>
                    </div>

                    <div className="taskActions">
                      <button className="editBtn">Edit</button>
                      <button
                        onClick={() => handleDeleteTask(task.task_id)}
                        className="deleteBtn"
                      >
                        Delete
                      </button>
                      <button className="doneBtn">DONE</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}