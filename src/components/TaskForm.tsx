'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Subject } from '@/types';

type WorkType = {
    id: string;
    work_type_detail: string;
};
export default function TaskForm({
    onTaskAdded,
    onDateChange,
}: {
    onTaskAdded: () => void;
    onDateChange: (date: string) => void;
}) {
    const [dueDate, setDueDate] = useState<string>('');
    const [teacher, setTeacher] = useState<string>('');
    const [subject, setSubject] = useState<string>('');
    // const [workType, setWorkType] = useState<string>('Personal');
    const [wtf, setWtf] = useState<string>('');
    const [subjects, setSubjects] = useState<Subject[]>([]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects`)
            .then(res => res.json())
            .then((data: Subject[]) => setSubjects(data))
            .catch(err => console.error('Error loading subjects:', err));
    }, []);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setDueDate(today);
        onDateChange(today);
    }, [onDateChange]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value;
        setDueDate(date);
        onDateChange(date);
    };

    const handleSubmit = async () => {
        let finalDueDate = dueDate;

        if (workTypec === 'School Event' || workTypec === 'School Exam') {
            if (!wtf) {
                alert('Please fill in What to Finish.');
                return;
            }
        } else {
            if (!dueDate || !teacher || !subject || !wtf) {
                alert('Please fill in all required fields.');
                return;
            }
        }

        const adminUsername = localStorage.getItem('adminName');

        const body = {
            // task_id: 'TASK_' + Date.now(),
            due_date: new Date(finalDueDate).toISOString(),
            teacher: workTypec === 'School Event' ? '' : teacher,
            subject: workTypec === 'School Event' ? '' : subject,
            detail: wtf,
            work_type_id: workTypec,
            created_by: adminUsername || null,
            created_on: new Date().toISOString(),
            delindicator: false,
        };

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                },
            );

            if (!res.ok) {
                const error = await res.json();
                alert('Failed to add task: ' + (error.error || res.statusText));
                return;
            }

            alert('Task Added!');
            await fetchTasks();
            onTaskAdded();
            // Reset form
            const todayStr = new Date().toISOString().split('T')[0];
            setDueDate(todayStr);
            setWtf('');
        } catch (error) {
            alert('Network error');
        }
    };

    useEffect(() => {
        if (!teacher) {
            setSubject('');
            return;
        }

        const filteredSubjects = subjects.filter(s => s.teacher === teacher);

        if (filteredSubjects.length === 1) {
            setSubject(filteredSubjects[0].subject);
        } else {
            setSubject('');
        }
    }, [teacher, subjects]);

    const fetchTasks = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
            );
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };
    const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
    const [workTypec, setWorkTypec] = useState<string>('');
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/work-type`) // เปลี่ยนเป็น endpoint ที่คุณสร้างจริง
            .then(res => res.json())
            .then(data => setWorkTypes(data));
    }, []);
    return (
        <div className="w-full p-6">
            {/* Form Fields Container */}
            <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl bg-pink-50 p-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Due Date Field */}
                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-gray-700">
                        Due Date *
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={handleDateChange}
                        className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    />
                </div>

                {/* Teacher Field - Only show if not School Event or School Exam */}
                {workTypec !== 'School Event' &&
                    workTypec !== 'School Exam' && (
                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-semibold text-gray-700">
                                Teacher *
                            </label>
                            <select
                                value={teacher}
                                onChange={e => {
                                    setTeacher(e.target.value);
                                    const teacherSubjects = subjects.filter(
                                        s => s.teacher === e.target.value,
                                    );
                                    if (teacherSubjects.length === 1) {
                                        setSubject(teacherSubjects[0].subject);
                                    } else if (teacherSubjects.length === 0) {
                                        setSubject('');
                                    }
                                }}
                                className="w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                            >
                                <option value="">Select Teacher</option>
                                {[...new Set(subjects.map(s => s.teacher))].map(
                                    t => (
                                        <option
                                            key={t}
                                            value={t}
                                        >
                                            {t}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                    )}

                {/* Subject Field - Only show if not School Event or School Exam */}
                {workTypec !== 'School Event' &&
                    workTypec !== 'School Exam' && (
                        <div className="flex flex-col">
                            <label className="mb-2 text-sm font-semibold text-gray-700">
                                Subject *
                            </label>
                            <select
                                value={subject}
                                onChange={e => {
                                    setSubject(e.target.value);
                                    const selectedSubject = subjects.find(
                                        s => s.subject === e.target.value,
                                    );
                                    if (selectedSubject) {
                                        setTeacher(selectedSubject.teacher);
                                    } else {
                                        setTeacher('');
                                    }
                                }}
                                className="w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                            >
                                <option value="">Select Subject</option>
                                {[...new Set(subjects.map(s => s.subject))].map(
                                    subj => (
                                        <option
                                            key={subj}
                                            value={subj}
                                        >
                                            {subj}
                                        </option>
                                    ),
                                )}
                            </select>
                        </div>
                    )}

                {/* Work Type Field */}
                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-gray-700">
                        Work Type *
                    </label>
                    <select
                        value={workTypec}
                        onChange={e => setWorkTypec(e.target.value)}
                        className="w-full cursor-pointer rounded-lg border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    >
                        {workTypes.map(wt => (
                            <option
                                key={wt.id}
                                value={wt.id}
                            >
                                {wt.work_type_detail}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* What to finish Field */}
            <div className="mb-6 flex flex-col rounded-2xl bg-pink-50 p-6">
                <label className="mb-3 text-sm font-semibold text-gray-700">
                    What to finish *
                </label>
                <textarea
                    value={wtf}
                    onChange={e => setWtf(e.target.value)}
                    placeholder="What to finish"
                    className="min-h-[200px] w-full resize-none rounded-lg border-2 border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                    rows={8}
                />
            </div>

            {/* Submit Button - Moved to left */}
            <div className="flex justify-start">
                <button
                    onClick={handleSubmit}
                    className="transform rounded-lg bg-blue-500 px-8 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-blue-600 hover:shadow-lg focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none"
                >
                    Add Task
                </button>
            </div>
        </div>
    );
}
