"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import "./mystudy.css";
import "./taskcard.css";

interface StudyPlan {
  sp_id: string;
  username: string;
  datetime: string;
  task_id: string;
  description: string;
  est_dur_min: number;
  status: string;
  start_time: string;
}

interface Task {
  sid: number;
  task_id: string;
  due_date: string;
  teacher: string;
  subject: string;
  wtf: string;
  work_type: string;
  created_by: string;
  created_on: string;
  delindicator: boolean;
  last_updated_by: string;
  last_updated_timestamp: string;
}

interface StudyPlanWithTask {
  study_plan: StudyPlan;
  task: Task;
}

export default function MyStudentPlan() {
  const { data: session } = useSession();
  const [studyPlansWithTasks, setStudyPlansWithTasks] = useState<StudyPlanWithTask[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentCardDate, setCurrentCardDate] = useState("");
  const [newActivity, setNewActivity] = useState({
    time: "",
    duration: "",
    description: "",
  });
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editActivity, setEditActivity] = useState({
    time: "",
    duration: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user?.username) {
      fetchStudyPlans();
    }
  }, [session]);

  const fetchStudyPlans = async () => {
    if (!session?.user?.username) return;
    
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/study-plans/${session.user.username}`
      );
      
      if (!res.ok) throw new Error("Failed to fetch study plans");
      
      const data: StudyPlanWithTask[] = await res.json();
      setStudyPlansWithTasks(data);
    } catch (err) {
      console.error("Error fetching study plans:", err);
      setError("Failed to load study plans");
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivityClick = (date: string) => {
    setCurrentCardDate(date);
    setShowAddForm(true);
  };

  const handleSaveActivity = async () => {
    if (!session?.user?.username) {
      alert("Please login first");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/study-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: session.user.username,
          datetime: currentCardDate,
          description: newActivity.description,
          est_dur_min: parseInt(newActivity.duration) * 60 || 0,
          start_time: newActivity.time,
          status: "pending",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save activity");
      }

      fetchStudyPlans();
      setShowAddForm(false);
      setNewActivity({ time: "", duration: "", description: "" });
    } catch (err) {
      console.error("Error saving activity:", err);
      alert(err instanceof Error ? err.message : "Failed to save activity");
    }
  };

  const handleDiscardActivity = () => {
    setShowAddForm(false);
    setNewActivity({ time: "", duration: "", description: "" });
  };

  const handleEditClick = (plan: StudyPlan) => {
    setEditingPlanId(plan.sp_id);
    setEditActivity({
      time: plan.start_time || "",
      duration: Math.floor(plan.est_dur_min / 60).toString(),
      description: plan.description || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
    setEditActivity({ time: "", duration: "", description: "" });
  };

  const handleUpdateActivity = async () => {
    if (!editingPlanId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/study-plan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sp_id: editingPlanId,
          start_time: editActivity.time,
          est_dur_min: parseInt(editActivity.duration) * 60 || 0,
          description: editActivity.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update activity");
      }

      fetchStudyPlans();
      setEditingPlanId(null);
      setEditActivity({ time: "", duration: "", description: "" });
    } catch (err) {
      console.error("Error updating activity:", err);
      alert(err instanceof Error ? err.message : "Failed to update activity");
    }
  };

  const handleMarkAsDone = async (spId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/study-plan/${spId}/done`,
        {
          method: "PUT",
        }
      );
      
      if (!response.ok) throw new Error("Failed to mark as done");
      
      fetchStudyPlans();
    } catch (err) {
      console.error("Error marking as done:", err);
      alert("Failed to mark as done");
    }
  };

  const handleDeleteStudyPlan = async (spId: string) => {
    if (!confirm("Are you sure you want to delete this study plan?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/study-plan/${spId}/delete`,
        {
          method: "PUT",
        }
      );
      
      if (!response.ok) throw new Error("Failed to delete study plan");
      
      fetchStudyPlans();
    } catch (err) {
      console.error("Error deleting study plan:", err);
      alert("Failed to delete study plan");
    }
  };

  // Group study plans by date
  const groupedStudyPlans = studyPlansWithTasks.reduce((acc: Record<string, StudyPlanWithTask[]>, planWithTask) => {
    const date = planWithTask.study_plan.datetime;
    if (!date) return acc;
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(planWithTask);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedStudyPlans).sort();

  if (!session) {
    return (
      <div className="p-4">
        <p>Please sign in to view your study plan</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

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

      {/* Study Plans List */}
      <div className="cardContainer">
        {sortedDates.length === 0 ? (
          <div className="empty-message">No study plans found</div>
        ) : (
          sortedDates.map((date) => {
            const plansForDate = groupedStudyPlans[date] || [];
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
                  onClick={() => handleAddActivityClick(date)}
                >
                  Add more activities
                </button>

                {/* Activity form (shown only for current card) */}
                {showAddForm && currentCardDate === date && (
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
                        min="0"
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

                {/* Study Plans for this date */}
                {plansForDate.map(({ study_plan, task }) => (
                  <div key={study_plan.sp_id} className="taskCard">
                    {editingPlanId === study_plan.sp_id ? (
                      <div className="activity-form">
                        <div className="form-group">
                          <label>Time</label>
                          <input
                            type="time"
                            value={editActivity.time}
                            onChange={(e) =>
                              setEditActivity({
                                ...editActivity,
                                time: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="form-group">
                          <label>Duration (Hours)</label>
                          <input
                            type="number"
                            value={editActivity.duration}
                            onChange={(e) =>
                              setEditActivity({
                                ...editActivity,
                                duration: e.target.value,
                              })
                            }
                            placeholder="Estimate duration"
                            min="0"
                          />
                        </div>
                        <div className="form-group">
                          <label>My Note</label>
                          <textarea
                            value={editActivity.description}
                            onChange={(e) =>
                              setEditActivity({
                                ...editActivity,
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
                            onClick={handleUpdateActivity}
                          >
                            Update
                          </button>
                          <button
                            className="discard-btn"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="taskHeader">
                          <strong>
                            {task.teacher && task.subject 
                              ? `${task.teacher} : ${task.subject}` 
                              : "Study Plan"}
                          </strong>
                          <span className={`typeTag ${study_plan.status.toLowerCase()}`}>
                            {study_plan.status}
                          </span>
                        </div>
                        <div className="taskBody">
                          {task.wtf && (
                            <p className="Detail-Task">Task Details: <span className="Detail-Description">{task.wtf}</span></p>
                          )}
                          <p className="Plan-Task"> Plan Description: <span className="Plan-Description">{study_plan.description || 'No description'}</span></p>

                          <p>Time: {study_plan.start_time || 'Not specified'}</p>
                          <p>Duration: {Math.floor((study_plan.est_dur_min || 0) / 60)} hours</p>
                          {/* แสดงข้อมูล wtf จาก Task เสมอ */}

                          {task.work_type && (
                            <p>Type: {task.work_type}</p>
                          )}
                        </div>
                        <div className="taskCreator">
                          <span className="creatorLabel">by :</span>
                          <span className="creatorName">
                            {task.created_by || "Unknown"}
                          </span>
                        </div>
                        <div className="taskActions">
                          <button
                            onClick={() => handleEditClick(study_plan)}
                            className="editBtn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStudyPlan(study_plan.sp_id)}
                            className="deleteBtn"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleMarkAsDone(study_plan.sp_id)}
                            className="doneBtn"
                            disabled={study_plan.status === "done"}
                          >
                            {study_plan.status === "done" ? "Completed" : "DONE"}
                          </button>
                        </div>
                      </>
                    )}
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