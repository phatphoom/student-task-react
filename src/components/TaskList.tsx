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
                // last_updated_by: userId || editData.last_updated_by || 1,
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
        const confirmed = confirm('Are you sure you want to delete this note?');
        if (!confirmed) return;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/task-notes/${noteId}`,
                {
                    method: 'DELETE',
                },
            );

            if (res.ok) {
                // อัพเดท state notes โดยตรง
                setNotes(prevNotes =>
                    prevNotes.filter(note => note.note_id !== noteId),
                );

                // อัพเดทจำนวนโน็ตใน taskNoteCounts
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
        <div className="grid w-full [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] gap-4 p-4">
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
                        className="h-fit min-h-[100px] w-full border-[3px] border-[#747474] bg-[#f9f9f9] shadow-md"
                    >
                        <div className="spacing flex items-center justify-between bg-[#b3d4fc] p-2 text-base font-bold text-black">
                            {date}{' '}
                            <span className="ml-auto text-base font-bold uppercase">
                                {weekday}
                            </span>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="p-5 text-center font-medium text-[color:#718096] italic">
                                No Task Dued: Yeah!!! Very Happy
                            </div>
                        ) : (
                            sortedTasks.map(t => {
                                const isHomework =
                                    t.work_type === 'Group' ||
                                    t.work_type === 'Personal';
                                if (isHomework) homeworkCounter++;

                                return (
                                    <div
                                        key={`${t.sid}-${t.task_id}`}
                                        className={`box-border p-2 ${
                                            t.work_type === 'School Event'
                                                ? 'border-l-4 border-l-[#d68fcf] bg-[#f4dbf2] text-[#2c9ff2]'
                                                : t.work_type === 'School Exam'
                                                  ? 'border-l-4 border-l-[#d68fcf] bg-[#f4dbf2]'
                                                  : 'bg-[#fafafa] text-[#2c9ff2]'
                                        }`}
                                        data-work-type={t.work_type}
                                    >
                                        {editingId ===
                                        `${t.sid}-${t.task_id}` ? (
                                            <div className="flex flex-col gap-[0.8rem]">
                                                <EditForm
                                                    editData={editData}
                                                    setEditData={setEditData}
                                                    handleSave={() =>
                                                        handleSave(
                                                            String(t.task_id),
                                                        )
                                                    }
                                                    handleCancel={handleCancel}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="mb-2 flex items-center gap-2">
                                                    {isHomework && (
                                                        <span>
                                                            {homeworkCounter}
                                                            .{' '}
                                                        </span>
                                                    )}
                                                    {t.work_type !==
                                                        'School Event' &&
                                                        t.work_type !==
                                                            'School Exam' && (
                                                            <strong>
                                                                {t.teacher} :{' '}
                                                                {t.subject}
                                                            </strong>
                                                        )}
                                                    <span className="p-[0.2rem 0.4rem] mr-auto rounded-sm bg-[#fff] text-base">
                                                        {t.work_type}
                                                    </span>
                                                </div>
                                                <div className="m-[0.4rem 0] border-radius[4px] bg-white p-2 text-base break-words whitespace-pre-wrap text-[#0005ff]">
                                                    {t.wtf}
                                                </div>

                                                <div className="mt-[8xp] flex items-end justify-end text-[#4e4e4e]">
                                                    <span className="mr-[4px]">
                                                        by :
                                                    </span>
                                                    <span className="italic">
                                                        {t.created_by_name ||
                                                            'Unknown'}
                                                    </span>
                                                </div>

                                                <div className="mt-2 flex justify-end gap-2">
                                                    <button
                                                        className="mr-auto flex cursor-pointer items-center border-none bg-none p-[5px] text-[24px] text-[#2c9ff2] transition-all duration-200 ease-in-out hover:text-[#0077cc]"
                                                        onClick={() =>
                                                            openNoteModal(t)
                                                        }
                                                    >
                                                        📝
                                                        {taskNoteCounts[
                                                            t.task_id
                                                        ] > 0 && (
                                                            <span className="bg-[rgba(255,255,255,0.2) p-[2px 6px] ml-[2px] rounded-xl text-[0.8rem] font-bold text-[#0005ff]">
                                                                (
                                                                {
                                                                    taskNoteCounts[
                                                                        t
                                                                            .task_id
                                                                    ]
                                                                }
                                                                )
                                                            </span>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleEdit(t)
                                                        }
                                                        className="scale-[1.05] cursor-pointer rounded-sm border-none bg-[#87d18a] px-3 py-1.5 text-base text-white transition-all duration-200 ease-in-out hover:bg-[#308533]"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                String(
                                                                    t.task_id,
                                                                ),
                                                            )
                                                        }
                                                        className="cursor-pointer rounded border-none bg-red-400 px-3 py-1.5 text-base text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-green-700"
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
                <div
                    className="fixed top-0 left-0 z-50 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,.5)]"
                    onClick={closeNoteModal}
                >
                    <div
                        className="animate-modalFadeIn relativemax-md:w-[95%] max-h-[95vh] w-[400px] max-w-[90%] overflow-y-auto rounded-xl bg-white p-5 shadow-lg max-md:rounded-[10px] max-md:p-[15px]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="relative mb-3 flex items-center justify-between pr-[30px] font-bold text-[#2c9ff2] max-md:w-[95%] max-md:rounded-[10px] max-md:p-[15px]">
                            <strong>
                                {selectedTask.teacher} : {selectedTask.subject}
                            </strong>
                            <span className="ml-auto rounded-[4px] bg-white px-[0.4rem] py-[0.2rem] text-base max-md:mt-[5px] max-md:self-start">
                                {selectedTask.work_type}
                            </span>
                            <button
                                onClick={closeNoteModal}
                                className="absolute top-[12px] right-[12px] z-10 cursor-pointer border-none bg-transparent text-xl text-[#555] hover:scale-105 hover:text-[#ff0000] hover:transition-[background-color,transform] hover:duration-300 hover:ease-in-out"
                            >
                                ✖
                            </button>
                        </div>

                        <div className="mb-3 text-base">
                            <div className="existing-notes">
                                {notes.length > 0 ? (
                                    notes.map((item, index) => (
                                        <div
                                            key={index}
                                            className="animate-noteFadeIn mb-4 border-b border-gray-200 pb-4"
                                        >
                                            <div className="relative flex items-center justify-between bg-[#b3d4fc] px-4 py-3 text-black max-md:flex-col max-md:items-start max-md:p-[12px]">
                                                <strong className="flex-1 text-[15px] font-semibold max-md:mb-[5px] max-md:text-[14px]">
                                                    Note {index + 1} : by{' '}
                                                    {item.note_by}
                                                </strong>{' '}
                                                <span className="mr-10 ml-10 text-right text-[0.85rem] text-[#00000] max-md:ml-0 max-md:w-full max-md:text-left max-md:text-[0.8rem]">
                                                    {new Date(
                                                        item.note_date,
                                                    ).toLocaleString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false,
                                                    })}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteNote(
                                                            item.note_id,
                                                        )
                                                    }
                                                    className="cursor-pointer rounded-sm border-none bg-[#f37e75] p-1.5 text-[0.85rem] text-white transition-all duration-200 ease-in hover:scale-105 hover:bg-[#e74c3c] max-md:px-[10px] max-md:py-[5px] max-md:text-[0.8rem]"
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
                                    <div className="animate-noteFadeIn mb-4 border-b border-gray-200 pt-4 pb-4">
                                        No notes available
                                    </div>
                                )}
                            </div>

                            <div className="my-10 inline-block rounded-full bg-[#d68fcf] px-4 py-2 text-center text-base font-medium text-black max-md:px-[12px] max-md:py-[6px] max-md:text-[0.9rem]">
                                Add your Note:
                            </div>
                            <textarea
                                placeholder="Add your note..."
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                className="mt-2.5 h-20 w-full resize-none rounded-lg border border-[#ccc] p-2 text-sm focus:border-[#f0c5ed] focus:shadow-[0_0_3px_#f0c5ed] focus:outline-none max-md:h-[100px]"
                            />
                            <input
                                type="text"
                                placeholder="Your Name *"
                                value={yourName}
                                onChange={e => setYourName(e.target.value)}
                                className="border-[1px solid #ccc] mt-2.5 w-full rounded-[8px] p-2 text-sm"
                            />
                            {error && (
                                <div className="p-[16px 20px] m-[16px 0] border-[1px solid rgba(245,101,101,0.1)] rounded-2xl bg-[rgba(245,101,101,0.1)] font-semibold text-[#c53030]">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xl">
                            <button
                                onClick={handleSaveNote}
                                className="cursor-pointer rounded border-none bg-green-400 px-3 py-1.5 text-base text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-green-700"
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
            <div className="flex flex-col gap-[0.3rem]">
                <label className="text-[0.9rem] font-medium text-[#333]">
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
                    className="box-border w-full rounded-[4px] border border-[#ddd] bg-white p-[0.4rem] text-[0.9rem] focus:border-[#b3d4fc] focus:outline-2 focus:outline-[#b3d4fc]"
                />
            </div>
            <div className="flex flex-col gap-[0.3rem]">
                <label className="text-[0.9rem] font-medium text-[#333]">
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
                    className="box-border w-full rounded-[4px] border border-[#ddd] bg-white p-[0.4rem] text-[0.9rem] focus:border-[#b3d4fc] focus:outline-2 focus:outline-[#b3d4fc]"
                />
            </div>
            <div className="flex flex-col gap-[0.3rem]">
                <label className="text-[0.9rem] font-medium text-[#333]">
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
                    className="box-border w-full rounded-[4px] border border-[#ddd] bg-white p-[0.4rem] text-[0.9rem] focus:border-[#b3d4fc] focus:outline-2 focus:outline-[#b3d4fc]"
                >
                    <option value="">Select Type</option>
                    <option value="Group">Group</option>
                    <option value="Personal">Personal</option>
                    <option value="School Event">School Event</option>
                    <option value="School Exam">School Exam</option>
                </select>
            </div>
            <div className="flex flex-col gap-[0.3rem]">
                <label className="text-[0.9rem] font-medium text-[#333]">
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
                    className="box-border min-h-[60px] w-full resize-y rounded-[4px] border border-[#ddd] bg-white p-[0.4rem] text-[0.9rem] focus:border-[#b3d4fc] focus:outline-2 focus:outline-[#b3d4fc]"
                />
            </div>

            <div className="mt-2 flex justify-end gap-2">
                <button
                    onClick={handleSave}
                    className="cursor-pointer rounded border-none bg-green-400 px-3 py-1.5 text-base text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-green-700"
                >
                    Save
                </button>
                <button
                    onClick={handleCancel}
                    className="cursor-pointer rounded border-none bg-red-400 px-3 py-1.5 text-base text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-green-700"
                >
                    Cancel
                </button>
            </div>
        </>
    );
}
