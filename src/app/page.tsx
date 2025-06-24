"use client";

import Link from "next/link";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

import { Task, GroupedTasks, Note } from "@/types";

import "./reports.css";
import { GoogleUserResponse } from "@/types/google-signin";

export default function TaskInformation() {
  const { data: session, status, update } = useSession();

  // console.log(session?.user?.username); // from your DB
  // console.log(session?.user?.email); // from Google
  // console.log(session?.user?.userType); // from your DB
  // console.log(session?.user?.id); // from your DB

  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [shouldPrompt, setShouldPrompt] = useState(false);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});
  const [fullCalendarMode, setFullCalendarMode] = useState(false);
  const [yourName, setYourName] = useState(""); // ชื่อผู้พิมพ์
  const [error, setError] = useState(""); // error validation
  const [notes, setNotes] = useState<Note[]>([]);

  // เพิ่ม state สำหรับเก็บ note counts ของแต่ละ task
  const [taskNoteCounts, setTaskNoteCounts] = useState<{
    [key: number]: number;
  }>({});

  // เพิ่ม useState สำหรับ Note และ selectedTask
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setDateFrom(todayStr);
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`)
      .then((res) => res.json())
      .then((data: Task[]) => {
        setTasks(data);
        // โหลด note counts สำหรับแต่ละ task
        loadTaskNoteCounts(data);
      })
      .catch((error) => console.error("Error fetching tasks:", error));
  }, []);

  useEffect(() => {
    const verifyGoogleSignIn = async () => {
      if (status === "authenticated" && session?.user?.email) {
        const userExists = await checkIfUserExists(session.user.email);

        if (!userExists) {
          setShouldPrompt(true);
        }
      }
    };

    verifyGoogleSignIn();
  }, [session, status]);

  const handleGoogleSignIn = async (session: Session) => {
    if (!username.trim()) {
      alert("Please enter a valid username");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/google`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: session.user.email,
            username: username.trim(),
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();

        if (res.status === 409) {
          alert(errorData.message || "User already exists.");
        } else {
          alert(errorData.message || "Something went wrong.");
        }

        throw new Error(errorData.message || "Error occurred");
      }

      const data = (await res.json()) as GoogleUserResponse;
      setShouldPrompt(false);
      await update(); // re-fetches session data by re-calling your `session()` callback
    } catch (err) {
      console.error("Error syncing user:", err);
    }
  };

  const checkIfUserExists = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/check-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to check user existence");
      }

      const data = (await res.json()) as GoogleUserResponse;
      return data.exists;
    } catch (err) {
      console.error("Error checking user existence:", err);
      return false;
    }
  };

  const checkUsername = async (value: string) => {
    if (!value.trim()) return;

    setIsChecking(true);
    try {
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/check-username?username=${encodeURIComponent(value)}`
      );
      const data = await res.json();
      setIsAvailable(data.available);
    } catch (err) {
      console.error("Error checking username:", err);
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCloseGoogleSignInModal = () => {
    signOut();
    setShouldPrompt(false);
  };

  // ฟังก์ชันสำหรับโหลด note counts ของทุก task
  const loadTaskNoteCounts = async (tasksData: Task[]) => {
    try {
      const promises = tasksData.map(async (task) => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${task.task_id}`
          );
          const noteData = await res.json();
          return [task.task_id, Array.isArray(noteData) ? noteData.length : 0];
        } catch (err) {
          console.error(`Error loading notes for task ${task.task_id}:`, err);
          return [task.task_id, 0];
        }
      });

      const results = await Promise.all(promises);
      const counts: { [key: number]: number } = Object.fromEntries(results);

      setTaskNoteCounts(counts);
    } catch (err) {
      console.error("Failed to load task note counts:", err);
    }
  };

  useEffect(() => {
    if (dateFrom && tasks.length > 0) {
      updateGroupedTasks();
    }
  }, [dateFrom, tasks]);

  useEffect(() => {
    const user = localStorage.getItem("adminName");
    const logAccess = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/log-access`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            menu: "Work on Due Report",
            user: user ?? "",
            date_time: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("Failed to log access:", err);
      }
    };
    logAccess();
  }, []);

  const updateGroupedTasks = () => {
    const fromDate = new Date(dateFrom);
    fromDate.setHours(0, 0, 0, 0);

    const maxTaskDate = tasks.reduce((max, task) => {
      const taskDate = new Date(task.due_date);
      return taskDate > max ? taskDate : max;
    }, new Date(fromDate));

    maxTaskDate.setHours(23, 59, 59, 999);

    const filtered = tasks.filter((task) => {
      const taskDate = new Date(task.due_date);
      return taskDate >= fromDate && taskDate <= maxTaskDate;
    });

    const grouped = groupTasksByDate(filtered);
    setGroupedTasks(grouped);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB").replace(/\//g, ".");
  };

  const groupTasksByDate = (tasksToGroup: Task[]): GroupedTasks => {
    return tasksToGroup.reduce((acc: GroupedTasks, task: Task) => {
      const dateKey = formatDate(task.due_date);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(task);
      return acc;
    }, {});
  };

  const getSortedEntries = () => {
    const fromDate = new Date(dateFrom);
    const today = new Date(fromDate);
    today.setHours(0, 0, 0, 0);

    const toDate = new Date(
      tasks.reduce((max, task) => {
        const date = new Date(task.due_date);
        return date > max ? date : max;
      }, new Date(today))
    );
    toDate.setHours(0, 0, 0, 0);

    const entries: [string, Task[]][] = [];
    const currentDate = new Date(today);

    while (currentDate <= toDate) {
      const key = currentDate.toLocaleDateString("en-GB").replace(/\//g, ".");
      entries.push([key, groupedTasks[key] || []]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return entries;
  };

  const sortedEntries = fullCalendarMode
    ? getSortedEntries()
    : Object.entries(groupedTasks).sort(([a], [b]) => {
        const dateA = new Date(a.split(".").reverse().join("-"));
        const dateB = new Date(b.split(".").reverse().join("-"));
        return dateA.getTime() - dateB.getTime();
      });

  // เพิ่มฟังก์ชัน closeModal และ handleSaveNote
  const closeModal = () => {
    setSelectedTask(null);
    setNote("");
  };

  useEffect(() => {
    if (selectedTask) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${selectedTask.task_id}`
      )
        .then((res) => res.json())
        .then((data) => {
          setNotes(Array.isArray(data) ? data : []); // ✅ ป้องกัน map error
        })
        .catch((err) => {
          console.error("Error loading notes:", err);
          setNotes([]); // fallback
        });
    } else {
      setNotes([]);
    }
  }, [selectedTask]);

  const handleSaveNote = async () => {
    if (!note || !yourName) {
      setError("กรุณากรอกทั้ง Note และ Your Name");
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

      if (!res.ok) throw new Error("Failed to save");

      // รีโหลด notes
      const newNotes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${selectedTask?.task_id}`
      ).then((res) => res.json());

      setNotes(newNotes);
      setNote("");
      setYourName("");
      setError("");

      // อัพเดท note count ใน state
      if (selectedTask) {
        setTaskNoteCounts((prev) => ({
          ...prev,
          [selectedTask.task_id]: Array.isArray(newNotes) ? newNotes.length : 0,
        }));
      }
    } catch (err) {
      setError("บันทึกไม่สำเร็จ กรุณาลองใหม่");
      console.error("Save note error:", err);
    }
  };

  return (
    <div className="p-4">
      <div className="group-button-and-text">
        <div>
          <h1 className="title">
            Program SK149CNS - ฉันรักการบ้านที่ซู้ด V1.0 Build20250611
          </h1>

          {/* <div style={{ display: 'flex', flexDirection: 'row'}}> */}
          <div className="flex flex-row space-x-2">
            <h2 className="title">Class Room EP105</h2>

            {session && session.user.username ? (
              <>
                <p>Welcome, {session.user.username}!</p>
                <button onClick={() => signOut()}>Sign Out</button>
              </>
            ) : (
              <>
                <button onClick={() => signIn("google")}>
                  Sign In with Google
                </button>
                {/* <button
                  onClick={() => popupCenter("/sign-in", "Google Sign In")}
                >
                  Sign In with Google
                </button> */}
              </>
            )}
          </div>
        </div>
        <div className="top-right-button">
          {/* <Link href="/room-announcement" className="nav-btn3">
            Room Announcement
          </Link> */}
          <Link href="/Logins" className="nav-btn">
            Manage Due
          </Link>
          <Link href="/" className="nav-btn2">
            Work on Due Report
          </Link>
          {/* <Link href="/my-student-plan" className="nav-btn">
            My Study Plan
          </Link> */}
        </div>
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="form-row2">
            <div className="form-group2">
              <label className="form-label2">Date From : </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="form-input"
              />
              <button
                className="full-calendar-btn"
                onClick={() => setFullCalendarMode(!fullCalendarMode)}
              >
                {fullCalendarMode ? "Normal Mode" : "Full Calendar Mode"}
              </button>
            </div>
          </div>
        </div>
        <div className="card-container">
          {sortedEntries.map(([date, dateTasks]) => {
            try {
              const [day, month, year] = date.split(".").map(Number);
              const dateObj = new Date(year, month - 1, day);
              if (isNaN(dateObj.getTime())) throw new Error("Invalid Date");

              const weekday = new Intl.DateTimeFormat("en-US", {
                weekday: "short",
              }).format(dateObj);

              let homeworkCounter = 0;

              return (
                <div key={date} className="card">
                  <div className="card-header">
                    {date} <span className="weekday">{weekday}</span>
                  </div>
                  {dateTasks.length === 0 ? (
                    <div className="card-empty">
                      No Task Dued: Yeah!!! Very Happy
                    </div>
                  ) : (
                    <div className="task-day">
                      {dateTasks.map((task, index) => (
                        <div
                          key={task.task_id}
                          className={`task-item ${
                            task.work_type === "School Event"
                              ? "school-event"
                              : task.work_type === "School Exam"
                              ? "school-exam"
                              : ""
                          }`}
                        >
                          <div className="task-header">
                            {(task.work_type === "Group" ||
                              task.work_type === "Personal") && (
                              <strong>{index + 1}. </strong>
                            )}
                            {task.work_type !== "School Event" &&
                              task.work_type !== "School Exam" && (
                                <span className="teacher-subject">
                                  {task.teacher} : {task.subject}
                                </span>
                              )}
                            <span className="task-type">{task.work_type}</span>
                          </div>
                          <div className="task-body">{task.wtf}</div>
                          <div className="task-creator">
                            <button
                              className="open-note-btn"
                              onClick={() => setSelectedTask(task)}
                            >
                              📝{" "}
                              {taskNoteCounts[task.task_id] > 0 && (
                                <span className="note-count">
                                  ({taskNoteCounts[task.task_id]})
                                </span>
                              )}
                            </button>
                            <div className="creator-info">
                              <span className="creator-label">by :</span>
                              <span className="creator-name">
                                {(() => {
                                  const creator =
                                    task.created_by_name || "Unknown";
                                  const editor = task.last_updated_by;

                                  // ถ้าไม่มี editor หรือ editor เป็นคนเดียวกับ creator
                                  if (!editor || editor === creator) {
                                    return creator;
                                  }

                                  // ถ้ามี editor และเป็นคนต่างกัน
                                  return `${creator} / ${editor}`;
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            } catch (err) {
              console.error("Skipping invalid date:", date);
              return null;
            }
          })}
        </div>
      </div>
      {/* เพิ่ม Modal Popup ตรงนี้ ก่อนปิด div สุดท้าย */}
      {selectedTask && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <strong>
                {selectedTask.teacher} : {selectedTask.subject}
              </strong>
              <span className="task-type">{selectedTask.work_type}</span>
              <button onClick={closeModal} className="modal-close">
                ✖
              </button>
            </div>

            {/* ส่วนแสดง Note เดิม */}
            <div className="modal-body">
              <div className="existing-notes">
                {Array.isArray(notes) && notes.length > 0 ? (
                  notes.map((item, index) => (
                    <div key={index} className="note-item">
                      <div className="note-header">
                        <strong>
                          Note {index + 1} : by {item.note_by}
                        </strong>{" "}
                        <span className="note-date">
                          {new Date(item.note_date).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short", // ใช้ "long" ถ้าอยากให้เป็นชื่อเดือนเต็ม
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "Asia/Bangkok",
                          })}
                        </span>
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
                  <div className="note-item text-gray-500">
                    No notes available
                  </div>
                )}
              </div>
              {/* textarea สำหรับเพิ่ม Note ใหม่ */}
              <div className="note-title"> Add you Note : </div>
              <textarea
                placeholder="Add your note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="modal-note"
              />
              {/* input Your Name */}
              <input
                type="text"
                placeholder="Your Name *"
                value={yourName}
                onChange={(e) => setYourName(e.target.value)}
                className="modal-name-input"
              />
              {/* แจ้งเตือน error */}
              {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={handleSaveNote} className="modal-save-btn">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {shouldPrompt && session && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <button
                onClick={handleCloseGoogleSignInModal}
                className="modal-close"
              >
                ✖
              </button>
            </div>

            <div className="modal-body">
              <div className="username">Create a new username to continue</div>
              <input
                type="text"
                className="modal-name-input"
                placeholder="Create a new username"
                value={username}
                onChange={(e) => {
                  const val = e.target.value;
                  setUsername(val);
                  setIsAvailable(null);
                }}
                onBlur={() => checkUsername(username)}
              />

              {isChecking && <p>Checking...</p>}
              {isAvailable === true && (
                <p style={{ color: "green" }}>Username is available ✅</p>
              )}
              {isAvailable === false && (
                <p style={{ color: "red" }}>Username is already taken ❌</p>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="modal-save-btn"
                disabled={!username || isAvailable === false}
                onClick={() => handleGoogleSignIn(session)}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
