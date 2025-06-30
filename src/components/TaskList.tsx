//app/Components/TaskList.tsx
'use client';
import { useEffect, useState } from 'react';
import { Task, EditData, Note } from '@/types';
// import './tasklist.css';

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
        due_date: '',
        subject: '',
        teacher: '',
        wtf: '',
        work_type: '',
        created_by: '',
    });
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [notes, setNotes] = useState<Note[]>([]);
    const [note, setNote] = useState('');
    const [yourName, setYourName] = useState('');
    const [error, setError] = useState('');
    const [taskNoteCounts, setTaskNoteCounts] = useState<{
        [key: number]: number;
    }>({});

    useEffect(() => {
        fetchTasks();
    }, [refreshTrigger, startDate]);

    const fetchTasks = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
            );
            const data: Task[] = await res.json();
            const start = startDate ? new Date(startDate) : new Date();
            start.setHours(0, 0, 0, 0);

            const filtered = data.filter(t => {
                const td = new Date(t.due_date);
                td.setHours(0, 0, 0, 0);
                return td >= start;
            });
            console.log(filtered);
            setTasks(filtered);
            loadTaskNoteCounts(filtered);
        } catch (err) {
            console.error('Error fetching tasks:', err);
        }
    };

    const loadTaskNoteCounts = async (tasksData: Task[]) => {
        const counts: { [key: number]: number } = {};

        for (const task of tasksData) {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${task.task_id}`,
                );
                const noteData = await res.json();
                counts[task.task_id] = Array.isArray(noteData)
                    ? noteData.length
                    : 0;
            } catch (err) {
                console.error(
                    `Error loading notes for task ${task.task_id}:`,
                    err,
                );
                counts[task.task_id] = 0;
            }
        }

        setTaskNoteCounts(counts);
    };

    const handleEdit = (task: Task) => {
        setEditingId(`${task.sid}-${task.task_id}`);
        setEditData({
            due_date: task.due_date ? task.due_date.split('T')[0] : '',
            subject: task.subject || '',
            teacher: task.teacher || '',
            wtf: task.wtf || '',
            work_type: task.work_type || '',
            created_by: task.created_by || '',
        });
    };
    const handleSave = async (taskId: string) => {
        try {
            let userId = null;
            try {
                const userInfo = localStorage.getItem('userInfo');
                if (userInfo) {
                    const parsed = JSON.parse(userInfo);
                    userId = parsed.user_id || parsed.id;
                }
            } catch (e) {
                console.warn(
                    'Cannot access localStorage, using default user_id',
                );
            }

            const adminName = localStorage.getItem('adminName');

            const updatedTask = {
                ...editData,
                due_date: editData.due_date
                    ? `${editData.due_date}T00:00:00Z`
                    : null,
                created_by: editData.created_by,
                last_updated_by: adminName,
            };

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedTask),
                },
            );

            if (res.ok) {
                setEditingId(null);
                resetEditData();
                fetchTasks();
            } else {
                const err = await res.json();
                console.error('Failed to update:', err);
            }
        } catch (err) {
            console.error('Network error:', err);
        }
    };

    const handleDelete = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
                {
                    method: 'DELETE',
                },
            );
            fetchTasks();
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    const resetEditData = () => {
        setEditData({
            due_date: '',
            subject: '',
            teacher: '',
            wtf: '',
            work_type: '',
            created_by: '',
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
            dates.push(current.toLocaleDateString('en-GB'));
            current.setDate(current.getDate() + 1);
        }

        return dates;
    };

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

    const groupAndSortTasks = () => {
        const grouped: Record<string, Task[]> = {};
        const start = startDate ? new Date(startDate) : new Date();

        const maxDate = tasks.reduce((max, task) => {
            const taskDate = new Date(task.due_date);
            return taskDate > max ? taskDate : max;
        }, new Date(start));

        const dates = generateDateRangeFromTo(start, maxDate);
        dates.forEach(d => (grouped[d] = []));

        tasks.forEach(t => {
            const td = new Date(t.due_date);
            const key = td.toLocaleDateString('en-GB');
            if (grouped[key]) grouped[key].push(t);
        });

        return Object.entries(grouped)
            .filter(([, arr]) => arr.length > 0)
            .sort(([a], [b]) => {
                const da = new Date(a.split('/').reverse().join('-'));
                const db = new Date(b.split('/').reverse().join('-'));
                return da.getTime() - db.getTime();
            });
    };

    const openNoteModal = async (task: Task) => {
        setSelectedTask(task);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${task.task_id}`,
            );
            const data = await res.json();
            setNotes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading notes:', err);
            setNotes([]);
        }
    };

    const closeNoteModal = () => {
        setSelectedTask(null);
        setNote('');
        setYourName('');
        setError('');
    };

    const handleSaveNote = async () => {
        if (!note || !yourName) {
            setError('Please enter both Note and Your Name');
            return;
        }

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        task_id: selectedTask?.task_id,
                        note: note,
                        note_by: yourName,
                    }),
                },
            );

            if (!res.ok) throw new Error('Failed to save note');

            const newNotes = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${selectedTask?.task_id}`,
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
            setError('Failed to save note. Please try again.');
            console.error('Save note error:', err);
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        const task_id = selectedTask?.task_id;
        const confirmed = confirm('Are you sure you want to delete this note?');
        if (!confirmed) return;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${noteId}?task_id=${task_id}`,

                // /api/task-notes/${noteId}?task_id=${task_id}
                {
                    method: 'DELETE',
                },
            );

            if (res.ok) {
                setNotes(prevNotes =>
                    prevNotes.filter(note => note.note_id !== noteId),
                );

                if (selectedTask) {
                    setTaskNoteCounts(prev => ({
                        ...prev,
                        [selectedTask.task_id]: prev[selectedTask.task_id] - 1,
                    }));
                }

                alert('Note deleted successfully.');
            } else {
                const err = await res.json();
                console.error('Delete failed:', err);
                alert('Failed to delete note.');
            }
        } catch (err) {
            console.error('Error deleting note:', err);
            alert('Error deleting note.');
        }
    };

    return (
        <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
            {groupAndSortTasks().map(([date, tasksOnDate]) => {
                let [d, m, y] = date.split('/').map(Number);
                if (y > 2500) y -= 543;
                const dateObj = new Date(y, m - 1, d);
                const weekday = new Intl.DateTimeFormat('en-US', {
                    weekday: 'short',
                }).format(dateObj);

                const sortedTasks = sortTasksInDate(tasksOnDate);
                let homeworkCounter = 0;

                return (
                    <div
                        key={date}
                        className="h-fit min-h-[100px] w-full border-4 border-gray-500 bg-gray-100 shadow-md"
                    >
                        <div className="flex items-center justify-between bg-blue-200 p-2 text-base font-bold tracking-wider text-black">
                            {date}{' '}
                            <span className="ml-auto text-base font-bold uppercase">
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
                                            {editingId ===
                                            `${task.sid}-${task.task_id}` ? (
                                                <div className="flex flex-col gap-3">
                                                    <EditForm
                                                        editData={editData}
                                                        setEditData={
                                                            setEditData
                                                        }
                                                        handleSave={() =>
                                                            handleSave(
                                                                String(
                                                                    task.task_id,
                                                                ),
                                                            )
                                                        }
                                                        handleCancel={
                                                            handleCancel
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-center justify-between bg-gray-50 px-3 py-2 font-bold text-blue-500">
                                                        <div className="flex items-center gap-2">
                                                            {isHomework && (
                                                                <strong className="text-blue-500">
                                                                    {
                                                                        homeworkCounter
                                                                    }
                                                                    .{' '}
                                                                </strong>
                                                            )}
                                                            <span className="text-blue-500">
                                                                {task.work_type}
                                                            </span>
                                                        </div>
                                                        <span className="text-blue-500">
                                                            {task.work_type !==
                                                                'School Event' &&
                                                                task.work_type !==
                                                                    'School Exam' &&
                                                                `${task.teacher} : ${task.subject}`}
                                                        </span>
                                                    </div>

                                                    {/* Task Description */}
                                                    <div className="task-body px-3 py-2">
                                                        {task.detail}
                                                    </div>

                                                    {/* Footer - Notes button and Action buttons */}
                                                    <div className="mt-2 flex items-center justify-between gap-2 px-3 pb-2 text-gray-600">
                                                        <button
                                                            className="cursor-pointer border-none bg-transparent text-3xl hover:opacity-70"
                                                            onClick={() =>
                                                                openNoteModal(
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

                                                        <div className="flex flex-col items-end gap-1">
                                                            <div className="flex items-center gap-1 text-sm font-bold text-gray-600 italic">
                                                                <span className="mr-1">
                                                                    by :
                                                                </span>
                                                                <span className="italic">
                                                                    {(() => {
                                                                        const creator =
                                                                            task.created_by_name ||
                                                                            task.created_by ||
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

                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            task,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer rounded border-none bg-green-400 px-3 py-1.5 text-sm font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-green-600"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            String(
                                                                                task.task_id,
                                                                            ),
                                                                        )
                                                                    }
                                                                    className="cursor-pointer rounded border-none bg-red-400 px-3 py-1.5 text-sm font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-red-600"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Note Modal */}
            {selectedTask && (
                <div
                    className="bg-opacity-20 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
                    onClick={closeNoteModal}
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
                                onClick={closeNoteModal}
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
                                                <button
                                                    onClick={() =>
                                                        handleDeleteNote(
                                                            item.note_id,
                                                        )
                                                    }
                                                    className="cursor-pointer rounded border-none bg-red-400 px-1.5 py-1 text-sm text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
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
        </div>
    );
}

function EditForm({ editData, setEditData, handleSave, handleCancel }: any) {
    return (
        <>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Teacher:
                </label>
                <input
                    value={editData.teacher}
                    onChange={e =>
                        setEditData((prev: any) => ({
                            ...prev,
                            teacher: e.target.value,
                        }))
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Subject:
                </label>
                <input
                    value={editData.subject}
                    onChange={e =>
                        setEditData((prev: any) => ({
                            ...prev,
                            subject: e.target.value,
                        }))
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Type:
                </label>
                <select
                    value={editData.work_type}
                    onChange={e =>
                        setEditData((prev: any) => ({
                            ...prev,
                            work_type: e.target.value,
                        }))
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    <option value="">Select Type</option>
                    <option value="Group">Group</option>
                    <option value="Personal">Personal</option>
                    <option value="School Event">School Event</option>
                    <option value="School Exam">School Exam</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description:
                </label>
                <textarea
                    value={editData.wtf}
                    onChange={e =>
                        setEditData((prev: any) => ({
                            ...prev,
                            wtf: e.target.value,
                        }))
                    }
                    rows={3}
                    className="w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
            </div>

            <div className="flex justify-end gap-3">
                <button
                    onClick={handleSave}
                    className="rounded-md bg-green-400 px-4 py-2 text-white transition-colors duration-200 hover:bg-green-600"
                >
                    Save
                </button>
                <button
                    onClick={handleCancel}
                    className="rounded-md bg-red-500 px-4 py-2 text-white transition-colors duration-200 hover:bg-red-600"
                >
                    Cancel
                </button>
            </div>
        </>
    );
}
