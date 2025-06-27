'use client';

import axios from 'axios';
import Link from 'next/link';
import { Session } from 'next-auth';
import { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Task, GroupedTasks, Note } from '@/types';
import './reports.css';
import { GoogleUserResponse } from '@/types/google-signin';
import ActivityModal, {
    ActivityInput,
    CreateStudyPlanRequest,
} from '@/components/ActivityModal';

export default function TaskInformation() {
    const { data: session, status, update } = useSession();

    const [username, setUsername] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [shouldPrompt, setShouldPrompt] = useState(false);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [dateFrom, setDateFrom] = useState<string>('');
    const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});
    const [fullCalendarMode, setFullCalendarMode] = useState(false);
    const [yourName, setYourName] = useState('');
    const [error, setError] = useState('');
    const [notes, setNotes] = useState<Note[]>([]);

    const [taskNoteCounts, setTaskNoteCounts] = useState<{
        [key: number]: number;
    }>({});

    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [note, setNote] = useState<string>('');

    const [hasStudyPlan, setHasStudyPlan] = useState<boolean>(false);
    const [inputState, setInputState] = useState<ActivityInput>({
        hours: 0,
        minutes: 0,
        datetime: '',
        utcString: '',
        startTime: '',
        description: '',
    });
    const [isOpenActivityModal, setIsOpenActivityModal] =
        useState<boolean>(false);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setDateFrom(today);
    }, []);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`)
            .then(res => res.json())
            .then((data: Task[]) => {
                setTasks(data);
                loadTaskNoteCounts(data);
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }, []);

    useEffect(() => {
        const verifyGoogleSignIn = async () => {
            if (status === 'authenticated' && session?.user?.email) {
                const userExists = await checkIfUserExists(session.user.email);

                if (userExists) {
                    setHasStudyPlan(true);
                    return;
                }

                setShouldPrompt(true);
            }
        };

        verifyGoogleSignIn();
    }, [session, status]);

    const handleGoogleSignIn = async (session: Session) => {
        if (!username.trim()) {
            alert('Please enter a valid username');
            return;
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/google`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: session.user.email,
                        username: username.trim(),
                    }),
                },
            );

            if (!res.ok) {
                const errorData = await res.json();

                if (res.status === 409) {
                    alert(errorData.message || 'User already exists.');
                } else {
                    alert(errorData.message || 'Something went wrong.');
                }

                throw new Error(errorData.message || 'Error occurred');
            }

            const data = (await res.json()) as GoogleUserResponse;
            setShouldPrompt(false);
            await update();
        } catch (err) {
            console.error('Error syncing user:', err);
        }
    };

    const checkIfUserExists = async (email: string): Promise<boolean> => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/check-email`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email }),
                },
            );

            if (!res.ok) {
                throw new Error('Failed to check user existence');
            }

            const data = (await res.json()) as GoogleUserResponse;
            return data.exists;
        } catch (err) {
            console.error('Error checking user existence:', err);
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
                }/api/check-username?username=${encodeURIComponent(value)}`,
            );
            const data = await res.json();
            setIsAvailable(data.available);
        } catch (err) {
            console.error('Error checking username:', err);
            setIsAvailable(null);
        } finally {
            setIsChecking(false);
        }
    };

    const handleCloseGoogleSignInModal = () => {
        signOut();
        setShouldPrompt(false);
    };

    const loadTaskNoteCounts = async (tasksData: Task[]) => {
        try {
            const promises = tasksData.map(async task => {
                try {
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${task.task_id}`,
                    );
                    const noteData = await res.json();
                    return [
                        task.task_id,
                        Array.isArray(noteData) ? noteData.length : 0,
                    ];
                } catch (err) {
                    console.error(
                        `Error loading notes for task ${task.task_id}:`,
                        err,
                    );
                    return [task.task_id, 0];
                }
            });

            const results = await Promise.all(promises);
            const counts: { [key: number]: number } =
                Object.fromEntries(results);

            setTaskNoteCounts(counts);
        } catch (err) {
            console.error('Failed to load task note counts:', err);
        }
    };

    useEffect(() => {
        if (dateFrom && tasks.length > 0) {
            updateGroupedTasks();
        }
    }, [dateFrom, tasks]);

    useEffect(() => {
        const user = localStorage.getItem('adminName');
        const logAccess = async () => {
            try {
                await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/log-access`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            menu: 'Work on Due Report',
                            user: user ?? '',
                            date_time: new Date().toISOString(),
                        }),
                    },
                );
            } catch (err) {
                console.error('Failed to log access:', err);
            }
        };
        logAccess();
    }, []);

    const sortTasksInDate = (tasksOnDate: Task[]) => {
        return tasksOnDate.sort((a, b) => {
            const getPriority = (workType: string) => {
                switch (workType) {
                    case 'School Event':
                        return 1;
                    case 'School Exam':
                        return 2;
                    case 'Group':
                        return 3;
                    case 'Personal':
                        return 4;
                    default:
                        return 5;
                }
            };

            return getPriority(a.work_type) - getPriority(b.work_type);
        });
    };

    const updateGroupedTasks = () => {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);

        const maxTaskDate = tasks.reduce((max, task) => {
            const taskDate = new Date(task.due_date);
            return taskDate > max ? taskDate : max;
        }, new Date(fromDate));

        maxTaskDate.setHours(23, 59, 59, 999);

        const filtered = tasks.filter(task => {
            const taskDate = new Date(task.due_date);
            return taskDate >= fromDate && taskDate <= maxTaskDate;
        });

        const grouped = groupTasksByDate(filtered);
        setGroupedTasks(grouped);
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB').replace(/\//g, '.');
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
            }, new Date(today)),
        );
        toDate.setHours(0, 0, 0, 0);

        const entries: [string, Task[]][] = [];
        const currentDate = new Date(today);

        while (currentDate <= toDate) {
            const key = currentDate
                .toLocaleDateString('en-GB')
                .replace(/\//g, '.');
            entries.push([key, groupedTasks[key] || []]);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return entries;
    };

    const closeModal = () => {
        setSelectedTask(null);
        setNote('');
    };

    useEffect(() => {
        if (selectedTask) {
            fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${selectedTask.task_id}`,
            )
                .then(res => res.json())
                .then(data => {
                    setNotes(Array.isArray(data) ? data : []);
                })
                .catch(err => {
                    console.error('Error loading notes:', err);
                    setNotes([]);
                });
        } else {
            setNotes([]);
        }
    }, [selectedTask]);

    const handleSaveNote = async () => {
        if (!note?.trim() || !yourName?.trim()) {
            setError('กรุณากรอกทั้ง Note และ Your Name');
            return;
        }

        if (!selectedTask?.task_id) {
            setError('กรุณาเลือก Task ก่อนเพิ่ม Note');
            return;
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        task_id: selectedTask.task_id,
                        note: note.trim(),
                        note_by: yourName.trim(),
                    }),
                },
            );

            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || 'Failed to save note');
            }

            const newNotes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${selectedTask.task_id}`,
            ).then(res => res.json());

            setNotes(newNotes);
            setNote('');
            setYourName('');
            setError('');

            if (selectedTask) {
                setTaskNoteCounts(prev => ({
                    ...prev,
                    [selectedTask.task_id]: Array.isArray(newNotes)
                        ? newNotes.length
                        : 0,
                }));
            }
        } catch (err) {
            setError('บันทึกไม่สำเร็จ กรุณาลองใหม่');
            console.error('Save note error:', err);
        }
    };

    const onChangeActivityInput = <K extends keyof ActivityInput>(
        key: K,
        value: ActivityInput[K],
    ) => {
        setInputState(prev => ({ ...prev, [key]: value }));
    };

    const handleCreateStudyPlan = async () => {
        if (!session || !session.user.username) {
            console.error('username is required');
            return;
        }

        try {
            const {
                hours,
                minutes,
                datetime,
                utcString,
                startTime,
                description,
            } = inputState;

            const request: CreateStudyPlanRequest = {
                username: session?.user.username,
                task_id: String(selectedTask?.task_id) ?? '',
                est_dur_min: hours * 60 + minutes,
                datetime: datetime,
                start_time: startTime,
                description,
                status: 'pending',
            };

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/study-plan`,
                request,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            setSelectedTask(null);
            setIsOpenActivityModal(false);
            alert('Add to my study plan successfully');
        } catch (err) {
            console.error('error while try to add my study plan', err);
        }
    };

    const handleOpenActivityModal = (task: Task) => {
        setSelectedTask(task);
        setInputState({
            ...inputState,
            datetime: new Date(task.due_date).toISOString().split('T')[0],
        });
        setIsOpenActivityModal(true);
    };

    const handleCloseActivityModal = () => {
        setSelectedTask(null);
        setIsOpenActivityModal(false);
    };

    const sortedEntries = fullCalendarMode
        ? getSortedEntries()
        : Object.entries(groupedTasks).sort(([a], [b]) => {
              const dateA = new Date(a.split('.').reverse().join('-'));
              const dateB = new Date(b.split('.').reverse().join('-'));
              return dateA.getTime() - dateB.getTime();
          });

    return (
        <div className="p-4">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 rounded-lg bg-white p-4">
                    <div className="form-row2 rounded-lg bg-blue-100 p-4">
                        <div className="form-group2 flex flex-col items-center gap-2">
                            <label className="form-label2 font-bold">
                                Date From :{' '}
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="form-input rounded-xl border px-3 py-2"
                            />
                            <button
                                className="full-calendar-btn rounded-lg bg-pink-500 px-4 py-2 font-bold text-white transition hover:bg-pink-800"
                                onClick={() =>
                                    setFullCalendarMode(!fullCalendarMode)
                                }
                            >
                                {fullCalendarMode
                                    ? 'Normal Mode'
                                    : 'Full Calendar Mode'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid w-full grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-4">
                {sortedEntries.map(([date, dateTasks]) => {
                    try {
                        const [day, month, year] = date.split('.').map(Number);
                        const dateObj = new Date(year, month - 1, day);
                        if (isNaN(dateObj.getTime()))
                            throw new Error('Invalid Date');

                        const weekday = new Intl.DateTimeFormat('en-US', {
                            weekday: 'short',
                        }).format(dateObj);

                        const sortedTasks = sortTasksInDate(dateTasks);
                        let homeworkCounter = 0;

                        return (
                            <div
                                key={date}
                                className="flex h-fit w-full flex-col overflow-hidden border-[3px] border-[#747474] bg-white shadow-md transition-transform duration-200 ease-in-out"
                            >
                                <div className="flex items-center justify-between bg-[#b3d4fc] p-2 text-center text-base font-bold tracking-[2px] text-black">
                                    {date}{' '}
                                    <span className="weekday ml-2">
                                        {weekday}
                                    </span>
                                </div>
                                {sortedTasks.length === 0 ? (
                                    <div className="p-5 text-center font-medium text-[var(--text-light)] italic">
                                        No Task Dued: Yeah!!! Very Happy
                                    </div>
                                ) : (
                                    <div className="task-day p-2">
                                        {sortedTasks.map(task => {
                                            const isHomework =
                                                task.work_type === 'Group' ||
                                                task.work_type === 'Personal';
                                            if (isHomework) homeworkCounter++;

                                            return (
                                                <div
                                                    key={task.task_id}
                                                    className={`task-item mb-3 rounded p-3 ${
                                                        task.work_type ===
                                                        'School Event'
                                                            ? 'school-event border-l-4 border-purple-400 bg-purple-100'
                                                            : task.work_type ===
                                                                'School Exam'
                                                              ? 'school-exam border-l-4 border-red-400 bg-red-100'
                                                              : 'bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 font-bold text-blue-500">
                                                        {isHomework && (
                                                            <strong>
                                                                {
                                                                    homeworkCounter
                                                                }
                                                                .{' '}
                                                            </strong>
                                                        )}
                                                        {task.work_type !==
                                                            'School Event' &&
                                                            task.work_type !==
                                                                'School Exam' && (
                                                                <span className="min-w-0 flex-1 text-blue-500">
                                                                    {
                                                                        task.teacher
                                                                    }{' '}
                                                                    :{' '}
                                                                    {
                                                                        task.subject
                                                                    }
                                                                </span>
                                                            )}
                                                        <span className="ml-auto text-blue-500">
                                                            {task.work_type}
                                                        </span>
                                                    </div>
                                                    <div className="task-body">
                                                        {task.wtf}
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between gap-2 text-gray-600">
                                                        <button
                                                            className="cursor-pointer border-none bg-transparent text-3xl hover:opacity-70"
                                                            onClick={() =>
                                                                setSelectedTask(
                                                                    task,
                                                                )
                                                            }
                                                        >
                                                            📝{' '}
                                                            {taskNoteCounts[
                                                                task.task_id
                                                            ] > 0 && (
                                                                <span className="ml-[-3] text-2xl font-bold text-blue-600">
                                                                    (
                                                                    {
                                                                        taskNoteCounts[
                                                                            task
                                                                                .task_id
                                                                        ]
                                                                    }
                                                                    )
                                                                </span>
                                                            )}
                                                        </button>

                                                        {hasStudyPlan && (
                                                            <button
                                                                className="cursor-pointer border-none bg-transparent text-3xl hover:opacity-70"
                                                                onClick={() =>
                                                                    handleOpenActivityModal(
                                                                        task,
                                                                    )
                                                                }
                                                            >
                                                                ✍️
                                                            </button>
                                                        )}

                                                        <div className="flex items-center gap-1 font-bold italic">
                                                            <span className="mr-1">
                                                                by :
                                                            </span>
                                                            <span className="italic">
                                                                {(() => {
                                                                    const creator =
                                                                        task.created_by_name ||
                                                                        'Unknown';
                                                                    const editor =
                                                                        task.last_updated_by;

                                                                    if (
                                                                        !editor ||
                                                                        editor ===
                                                                            creator
                                                                    ) {
                                                                        return creator;
                                                                    }

                                                                    return `${creator} / ${editor}`;
                                                                })()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    } catch (err) {
                        console.error('Skipping invalid date:', date);
                        return null;
                    }
                })}
            </div>

            {selectedTask && !isOpenActivityModal && (
                <div
                    className="bg-opacity-20 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
                    onClick={closeModal}
                >
                    <div
                        className="animate-fadeIn scrollbar-thin scrollbar-thumb-gray-300 relative max-h-[95vh] w-96 max-w-[90%] overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="mb-3 flex items-center justify-between pr-8 font-bold">
                            <strong>
                                {selectedTask.teacher} : {selectedTask.subject}
                            </strong>
                            <span className="task-type">
                                {selectedTask.work_type}
                            </span>
                            <button
                                onClick={closeModal}
                                className="absolute top-3 right-3 z-10 cursor-pointer border-none bg-transparent text-xl text-gray-500 transition-colors hover:text-red-500"
                            >
                                ✖
                            </button>
                        </div>

                        <div className="mb-3 text-base">
                            <div className="existing-notes">
                                {Array.isArray(notes) && notes.length > 0 ? (
                                    notes.map((item, index) => (
                                        <div
                                            key={index}
                                            className="mb-4 border-b-2 border-blue-500 pb-4"
                                        >
                                            <div className="flex items-center justify-between rounded-lg bg-blue-200 p-3 text-black">
                                                <strong className="text-sm font-semibold">
                                                    Note {index + 1} : by{' '}
                                                    {item.note_by}
                                                </strong>{' '}
                                                <span className="whitespace-nowrap text-black">
                                                    {new Date(
                                                        item.note_date,
                                                    ).toLocaleString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false,
                                                        timeZone:
                                                            'Asia/Bangkok',
                                                    })}
                                                </span>
                                            </div>
                                            <div className="note-body">
                                                {item.note
                                                    .split('\n')
                                                    .map((line, idx) => (
                                                        <span key={idx}>
                                                            {line}
                                                            <br />
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="mb-4 border-b-2 border-blue-500 pb-4 text-gray-500">
                                        No notes available
                                    </div>
                                )}
                            </div>
                            <div className="inline-flex justify-center rounded-2xl bg-pink-400 px-4 py-1 text-center text-lg text-black">
                                {' '}
                                Add you Note :{' '}
                            </div>
                            <textarea
                                placeholder="Add your note..."
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                className="mt-2 h-20 w-full resize-none rounded-lg border border-gray-300 p-2 text-sm focus:border-pink-300 focus:shadow-lg focus:shadow-pink-300/30 focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Your Name *"
                                value={yourName}
                                onChange={e => setYourName(e.target.value)}
                                className="mt-2 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-pink-300 focus:shadow-lg focus:shadow-pink-300/30 focus:outline-none"
                            />
                            {error && (
                                <div className="mt-1 text-sm text-red-500">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xl">
                            <button
                                onClick={handleSaveNote}
                                className="cursor-pointer rounded-md border-none bg-blue-500 px-3 py-1.5 text-white transition-all hover:scale-105 hover:bg-blue-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isOpenActivityModal && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                    <div className="animate-fadeIn relative max-h-[95vh] w-96 max-w-[90%] overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">
                                Date and Time To-Do
                            </h2>
                            <div className="mt-2 border-b-2 border-gray-200 pb-2">
                                <p className="font-bold">Task:</p>
                                <p className="p mt-3 rounded-2xl bg-blue-300 p-3 text-black">
                                    {selectedTask?.teacher} -{' '}
                                    {selectedTask?.subject}: {selectedTask?.wtf}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    value={inputState.datetime}
                                    onChange={e =>
                                        onChangeActivityInput(
                                            'datetime',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Start Time *
                                </label>
                                <input
                                    type="time"
                                    value={inputState.startTime}
                                    onChange={e =>
                                        onChangeActivityInput(
                                            'startTime',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    My Note
                                </label>
                                <textarea
                                    placeholder="Add your notes here..."
                                    value={inputState.description}
                                    onChange={e =>
                                        onChangeActivityInput(
                                            'description',
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1 block w-full resize-none rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Estimate Duration (Hours)
                                </label>
                                <div className="mt-1 flex space-x-4">
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500">
                                            Hours:
                                        </label>
                                        <input
                                            type="number"
                                            value={inputState.hours}
                                            onChange={e =>
                                                onChangeActivityInput(
                                                    'hours',
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                            className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-500">
                                            Minutes:
                                        </label>
                                        <input
                                            type="number"
                                            value={inputState.minutes}
                                            onChange={e =>
                                                onChangeActivityInput(
                                                    'minutes',
                                                    parseInt(e.target.value) ||
                                                        0,
                                                )
                                            }
                                            className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={handleCloseActivityModal}
                                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateStudyPlan}
                                className="rounded-md bg-pink-300 px-4 py-2 text-sm font-medium text-white hover:bg-pink-500"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {shouldPrompt && session && (
                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                    <div
                        className="animate-fadeIn relative max-h-[95vh] w-96 max-w-[90%] overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="mb-3 flex items-center justify-between pr-8 font-bold">
                            <button
                                onClick={handleCloseGoogleSignInModal}
                                className="absolute top-3 right-3 z-10 cursor-pointer border-none bg-transparent text-xl text-gray-500 transition-colors hover:text-red-500"
                            >
                                ✖
                            </button>
                        </div>

                        <div className="mb-3 text-base">
                            <div className="username">
                                Create a new username to continue
                            </div>
                            <input
                                type="text"
                                className="mt-2 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-pink-300 focus:shadow-lg focus:shadow-pink-300/30 focus:outline-none"
                                placeholder="Create a new username"
                                value={username}
                                onChange={e => {
                                    const val = e.target.value;
                                    setUsername(val);
                                    setIsAvailable(null);
                                }}
                                onBlur={() => checkUsername(username)}
                            />

                            {isChecking && <p>Checking...</p>}
                            {isAvailable === true && (
                                <p style={{ color: 'green' }}>
                                    Username is available ✅
                                </p>
                            )}
                            {isAvailable === false && (
                                <p style={{ color: 'red' }}>
                                    Username is already taken ❌
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xl">
                            <button
                                className="cursor-pointer rounded-md border-none bg-blue-500 px-3 py-1.5 text-white transition-all hover:scale-105 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
