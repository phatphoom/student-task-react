'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Subject } from '@/types';

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
    const [workType, setWorkType] = useState<string>('Personal');
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

        if (workType === 'School Event' || workType === 'School Exam') {
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
            task_id: 'TASK_' + Date.now(),
            due_date: new Date(finalDueDate).toISOString(),
            teacher: workType === 'School Event' ? '' : teacher,
            subject: workType === 'School Event' ? '' : subject,
            wtf,
            work_type: workType,
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

    return (
        <div className="p-6 w-full">
            {/* Form Fields Container */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-2xl bg-pink-50 p-6">
                {/* Due Date Field */}
                <div className="flex flex-col">
                    <label className="mb-2 text-sm font-semibold text-gray-700">
                        Due Date *
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={handleDateChange}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white font-medium text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    />
                </div>

                {/* Teacher Field - Only show if not School Event or School Exam */}
                {workType !== 'School Event' && workType !== 'School Exam' && (
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
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white font-medium text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 cursor-pointer"
                        >
                            <option value="">Select Teacher</option>
                            {[...new Set(subjects.map(s => s.teacher))].map(
                                t => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>
                )}

                {/* Subject Field - Only show if not School Event or School Exam */}
                {workType !== 'School Event' && workType !== 'School Exam' && (
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
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white font-medium text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 cursor-pointer"
                        >
                            <option value="">Select Subject</option>
                            {[...new Set(subjects.map(s => s.subject))].map(
                                subj => (
                                    <option key={subj} value={subj}>
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
                        value={workType}
                        onChange={e => setWorkType(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-white font-medium text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 cursor-pointer"
                    >
                        <option>Group</option>
                        <option>Personal</option>
                        <option>School Event</option>
                        <option>School Exam</option>
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
                    className="w-full min-h-[200px] px-4 py-3 rounded-lg border-2 border-gray-200 bg-white font-medium text-gray-700 placeholder-gray-400 resize-none focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                    rows={8}
                />
            </div>

            {/* Submit Button - Moved to left */}
            <div className="flex justify-start">
                <button
                    onClick={handleSubmit}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                >
                    Add Task
                </button>
            </div>
        </div>
    );
}
