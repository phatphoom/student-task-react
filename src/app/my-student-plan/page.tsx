'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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
    const [studyPlansWithTasks, setStudyPlansWithTasks] = useState<
        StudyPlanWithTask[]
    >([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [currentCardDate, setCurrentCardDate] = useState('');
    const [newActivity, setNewActivity] = useState({
        time: '',
        duration: '',
        description: '',
    });
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
    const [editActivity, setEditActivity] = useState({
        time: '',
        duration: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
                `${process.env.NEXT_PUBLIC_API_URL}/api/study-plans/${session.user.username}`,
            );

            if (!res.ok) throw new Error('Failed to fetch study plans');

            const data: StudyPlanWithTask[] = await res.json();
            setStudyPlansWithTasks(data);
        } catch (err) {
            console.error('Error fetching study plans:', err);
            setError('Failed to load study plans');
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
            alert('Please login first');
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/study-plan`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: session.user.username,
                        datetime: currentCardDate,
                        description: newActivity.description,
                        est_dur_min: parseInt(newActivity.duration) * 60 || 0,
                        start_time: newActivity.time,
                        status: 'pending',
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save activity');
            }

            fetchStudyPlans();
            setShowAddForm(false);
            setNewActivity({ time: '', duration: '', description: '' });
        } catch (err) {
            console.error('Error saving activity:', err);
            alert(
                err instanceof Error ? err.message : 'Failed to save activity',
            );
        }
    };

    const handleDiscardActivity = () => {
        setShowAddForm(false);
        setNewActivity({ time: '', duration: '', description: '' });
    };

    const handleEditClick = (plan: StudyPlan) => {
        setEditingPlanId(plan.sp_id);
        setEditActivity({
            time: plan.start_time || '',
            duration: Math.floor(plan.est_dur_min / 60).toString(),
            description: plan.description || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingPlanId(null);
        setEditActivity({ time: '', duration: '', description: '' });
    };

    const handleUpdateActivity = async () => {
        if (!editingPlanId) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/study-plan`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        sp_id: editingPlanId,
                        start_time: editActivity.time,
                        est_dur_min: parseInt(editActivity.duration) * 60 || 0,
                        description: editActivity.description,
                    }),
                },
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update activity');
            }

            fetchStudyPlans();
            setEditingPlanId(null);
            setEditActivity({ time: '', duration: '', description: '' });
        } catch (err) {
            console.error('Error updating activity:', err);
            alert(
                err instanceof Error
                    ? err.message
                    : 'Failed to update activity',
            );
        }
    };

    const handleMarkAsDone = async (spId: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/study-plan/${spId}/done`,
                {
                    method: 'PUT',
                },
            );

            if (!response.ok) throw new Error('Failed to mark as done');

            fetchStudyPlans();
        } catch (err) {
            console.error('Error marking as done:', err);
            alert('Failed to mark as done');
        }
    };

    const handleDeleteStudyPlan = async (spId: string) => {
        if (!confirm('Are you sure you want to delete this study plan?'))
            return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/study-plan/${spId}/delete`,
                {
                    method: 'PUT',
                },
            );

            if (!response.ok) throw new Error('Failed to delete study plan');

            fetchStudyPlans();
        } catch (err) {
            console.error('Error deleting study plan:', err);
            alert('Failed to delete study plan');
        }
    };

    // Group study plans by date
    const groupedStudyPlans = studyPlansWithTasks.reduce(
        (acc: Record<string, StudyPlanWithTask[]>, planWithTask) => {
            const date = planWithTask.study_plan.datetime;
            if (!date) return acc;

            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(planWithTask);
            return acc;
        },
        {},
    );

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
        <div className="p-4 font-sans bg-white min-h-screen">
            {/* Header Section */}
            <div className="flex justify-between items-start flex-wrap bg-blue-50 p-4 rounded mb-4 gap-4">
                <div className="max-w-full flex-1">
                    <h1 className="text-2xl font-bold text-slate-800 ">
                        Program SK149CNS - ฉันรักการบ้านที่ซู้ด V1.0
                        Build20250611
                    </h1>
                    <h2 className="text-xl text-gray-800 mt-2 m-0">Class Room EP105</h2>
                </div>
                <div className="flex gap-4 flex-wrap items-center">
                    <Link
                        href="/room-announcement"
                        className="px-6 py-3 text-black font-bold rounded-full bg-white hover:bg-blue-100 hover:shadow-md transition duration-200 text-base"
                    >
                        <span className="text-blue-600 font-bold text-base whitespace-nowrap ">
                            Room Announcement
                            </span>
                    </Link>
                    <Link
                        href="/login"
                        className="px-6 py-3 text-black font-bold rounded-md bg-pink-200 hover:bg-pink-300 hover:shadow-md transition duration-200 text-base"
                    >
                        Manage Due
                    </Link>
                    <Link
                        href="/"
                        className="px-6 py-3 text-black font-bold rounded-md bg-blue-200 hover:bg-blue-300 hover:shadow-md transition duration-200 text-base"
                    >
                        Work on Due Report
                    </Link>
                    <Link
                        href="/my-student-plan"
                        className="px-6 py-3 text-black font-bold rounded-md bg-emerald-200 hover:bg-emerald-300 hover:shadow-md transition duration-200 text-base"
                    >
                        My Study plan
                    </Link>
                </div>
            </div>

            {/* Study Plans List */}
            <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-3 w-full mt-5">
                {sortedDates.length === 0 ? (
                    <div className="col-span-full text-center p-5 text-xl text-gray-600">No study plans found</div>
                ) : (
                    sortedDates.map(date => {
                        const plansForDate = groupedStudyPlans[date] || [];
                        const taskDate = new Date(date);
                        const formattedDate =
                            taskDate.toLocaleDateString('en-GB');
                        const weekday = taskDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                        });

                        return (
                            <div
                                key={date}
                                className="bg-gray-100 h-fit min-h-24 w-full shadow-md border-4 border-gray-600"
                            >
                                <div className="bg-blue-200 p-2 font-bold flex justify-between items-center text-black text-base tracking-wider">
                                    {formattedDate}{' '}
                                    <span className="font-bold text-base uppercase ml-auto">{weekday}</span>
                                </div>

                                {/* Add more activities button */}
                                <button
                                    className="w-full py-3 px-4 my-3 bg-white border-2 border-blue-600 rounded-md cursor-pointer text-blue-600 text-base font-medium text-center transition-all duration-300 shadow-sm hover:bg-blue-600 hover:text-white hover:-translate-y-px hover:shadow-lg hover:shadow-blue-600/20"
                                    onClick={() => handleAddActivityClick(date)}
                                >
                                    Add more activities
                                </button>

                                {/* Activity form (shown only for current card) */}
                                {showAddForm && currentCardDate === date && (
                                    <div className="bg-white border border-pink-300 p-4 my-4 rounded-lg shadow-sm">
                                        {/* Time Input */}
                                        <div className="mb-4">
                                        <label className="block mb-1 text-sm font-medium text-pink-800">
                                            Time
                                        </label>
                                        <input
                                            type="time"
                                            value={newActivity.time}
                                            onChange={e =>
                                            setNewActivity({ ...newActivity, time: e.target.value })
                                            }
                                            className="w-full p-2 border border-pink-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                        />
                                        </div>

                                        {/* Duration Input */}
                                        <div className="mb-4">
                                        <label className="block mb-1 text-sm font-medium text-pink-800">
                                            Duration (Hours)
                                        </label>
                                        <input
                                            type="number"
                                            value={newActivity.duration}
                                            onChange={e =>
                                            setNewActivity({ ...newActivity, duration: e.target.value })
                                            }
                                            placeholder="Estimate duration"
                                            min="0"
                                            className="w-full p-2 border border-pink-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
                                        />
                                        </div>

                                        {/* Description */}
                                        <div className="mb-4">
                                        <label className="block mb-1 text-sm font-medium text-pink-800">
                                            My Note
                                        </label>
                                        <textarea
                                            value={newActivity.description}
                                            onChange={e =>
                                            setNewActivity({ ...newActivity, description: e.target.value })
                                            }
                                            placeholder="What to do..."
                                            rows={3}
                                            className="w-full p-2 border border-pink-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-pink-300"
                                        />
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex gap-3 mt-4 justify-end">
                                        <button
                                            className="px-4 py-2 rounded-md text-sm font-semibold bg-green-500 text-white hover:bg-green-600 transition"
                                            onClick={handleSaveActivity}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="px-4 py-2 rounded-md text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition"
                                            onClick={handleDiscardActivity}
                                        >
                                            Discard
                                        </button>
                                        </div>
                                    </div>
                                )}

                                {/* Study Plans for this date */}
                                {plansForDate.map(({ study_plan, task }) => (
                                    <div
                                        key={study_plan.sp_id}
                                        className="text-blue-600 bg-gray-50 p-2 mb-4 box-border transition-all duration-300"
                                    >
                                        {editingPlanId === study_plan.sp_id ? (
                                            <div className="bg-gray-100 p-3 my-2 rounded border border-gray-300">
                                                <div className="mb-3">
                                                    <label className="block mb-1 text-sm text-gray-600">Time</label>
                                                    <input
                                                        type="time"
                                                        value={
                                                            editActivity.time
                                                        }
                                                        onChange={e =>
                                                            setEditActivity({
                                                                ...editActivity,
                                                                time: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="block mb-1 text-sm text-gray-600">
                                                        Duration (Hours)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={
                                                            editActivity.duration
                                                        }
                                                        onChange={e =>
                                                            setEditActivity({
                                                                ...editActivity,
                                                                duration:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="Estimate duration"
                                                        min="0"
                                                        className="w-full p-2 border border-gray-300 rounded text-sm"
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label className="block mb-1 text-sm text-gray-600">My Note</label>
                                                    <textarea
                                                        value={
                                                            editActivity.description
                                                        }
                                                        onChange={e =>
                                                            setEditActivity({
                                                                ...editActivity,
                                                                description:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="What to do..."
                                                        rows={3}
                                                        className="w-full p-2 border border-gray-300 rounded text-sm resize-y min-h-15"
                                                    />
                                                </div>
                                                <div className="flex gap-2 mt-3">
                                                    <button
                                                        className="px-4 py-2 border-none rounded cursor-pointer text-sm transition-all duration-200 bg-green-500 text-white hover:bg-green-600"
                                                        onClick={
                                                            handleUpdateActivity
                                                        }
                                                    >
                                                        Update
                                                    </button>
                                                    <button
                                                        className="px-4 py-2 border-none rounded cursor-pointer text-sm transition-all duration-200 bg-red-500 text-white hover:bg-red-600"
                                                        onClick={
                                                            handleCancelEdit
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <strong>
                                                        {task.teacher &&
                                                        task.subject
                                                            ? `${task.teacher} : ${task.subject}`
                                                            : 'Study Plan'}
                                                    </strong>
                                                    <span
                                                        className={`text-base px-2 py-1 ml-auto rounded ${
                                                            study_plan.status.toLowerCase() === 'done'
                                                                ? 'bg-green-400 text-white'
                                                                : 'bg-orange-400 text-white'
                                                        }`}
                                                    >
                                                        {study_plan.status}
                                                    </span>
                                                </div>
                                                <div className="bg-white text-gray-900 p-2 my-2 text-xl whitespace-pre-wrap break-words">
                                                    {task.wtf && (
                                                        <p className="bg-gray-200 font-bold p-2 whitespace-pre-wrap break-words text-blue-800 text-lg leading-6">
                                                            Task Details:{' '}
                                                            <span className="py-2 whitespace-pre-wrap break-words text-black text-base leading-6">
                                                                {task.wtf}
                                                            </span>
                                                        </p>
                                                    )}
                                                    <p className="my-2 bg-gray-200 font-bold p-2 whitespace-pre-wrap break-words text-blue-800 text-lg leading-6">
                                                        {' '}
                                                        Plan Description:{' '}
                                                        <span className="py-2 whitespace-pre-wrap break-words text-black text-base leading-6">
                                                            {study_plan.description ||
                                                                'No description'}
                                                        </span>
                                                    </p>

                                                    <p>
                                                        Time:{' '}
                                                        {study_plan.start_time ||
                                                            'Not specified'}
                                                    </p>
                                                    <p>
                                                        Duration:{' '}
                                                        {Math.floor(
                                                            (study_plan.est_dur_min ||
                                                                0) / 60,
                                                        )}{' '}
                                                        hours
                                                    </p>

                                                    {task.work_type && (
                                                        <p>
                                                            Type:{' '}
                                                            {task.work_type}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="mt-2 text-gray-700 font-bold flex items-end justify-end text-sm">
                                                    <span className="mr-1">
                                                        by :
                                                    </span>
                                                    <span className="italic">
                                                        {task.created_by ||
                                                            'Unknown'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-end gap-2 mt-2">
                                                    <button
                                                        onClick={() =>
                                                            handleEditClick(
                                                                study_plan,
                                                            )
                                                        }
                                                        className="px-3 py-2 sm:px-3 sm:py-2 text-base border-none rounded cursor-pointer transition-all duration-200 bg-blue-600 text-white hover:scale-105"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteStudyPlan(
                                                                study_plan.sp_id,
                                                            )
                                                        }
                                                        className="px-3 py-2 sm:px-3 sm:py-2 text-base border-none rounded cursor-pointer transition-all duration-200 bg-red-400 text-white hover:scale-105"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleMarkAsDone(
                                                                study_plan.sp_id,
                                                            )
                                                        }
                                                        className={`px-3 py-2 text-base border-none rounded cursor-pointer transition-all duration-200 ${
                                                            study_plan.status === 'done'
                                                                ? 'bg-green-400 cursor-not-allowed opacity-80'
                                                                : 'bg-green-500 hover:bg-green-600 hover:scale-105'
                                                        } text-white`}
                                                        disabled={
                                                            study_plan.status ===
                                                            'done'
                                                        }
                                                    >
                                                        {study_plan.status ===
                                                        'done'
                                                            ? 'Completed'
                                                            : 'DONE'}
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