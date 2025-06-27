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
        <div className="p-4">
            {/* <div className="position relative flex items-start justify-between">
                <div>
                    <h1 className="text-[2.5rem] font-extrabold text-black">
                        Program SK149CNS - ฉันรักการบ้านที่ซู้ด V1.0
                        Build20250611
                    </h1>
                    <h2 className="title">Class Room EP105</h2>
                </div>
                <div className="relative mt-0 flex gap-2.5">
                    <Link
                        href="/room-announcement"
                        className="nav-btn3"
                    >
                        Room Announcement
                    </Link>
                    <Link
                        href="/Manages"
                        className="nav-btn"
                    >
                        Manage Due
                    </Link>
                    <Link
                        href="/"
                        className="nav-btn2"
                    >
                        Work on Due Report
                    </Link>
                    <Link
                        href="/my-student-plan"
                        className="nav-btn"
                    >
                        My Study plan
                    </Link>
                </div>
            </div> */}

            <div className="mb-5 flex flex-wrap items-start gap-5 rounded-2xl bg-[#ff8acf12] p-5">
                <div className="flex flex-col gap-2 rounded-[14px] bg-[#ff8acf12] p-2.5 md:w-full md:max-w-full">
                    <label className="mb-1.5 min-w-max text-base font-bold whitespace-nowrap text-[#2d3748]">
                        Due Date *
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={handleDateChange}
                        className="box-border resize-none rounded-xl border-2 border-[#e2e8f0] bg-white px-4 py-3 font-[Kanit] text-[1.1rem]"
                    />
                </div>
                {workType !== 'School Event' && workType !== 'School Exam' && (
                    <>
                        <div className="flex flex-col gap-2 rounded-[14px] bg-[#ff8acf12] p-2.5 md:w-full md:max-w-full">
                            <label className="mb-1.5 min-w-max text-base font-bold whitespace-nowrap text-[#2d3748]">
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
                                className="box-border resize-none rounded-xl border-2 border-[#e2e8f0] bg-white px-4 py-3 font-[Kanit] text-[1.1rem]"
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
                        <div className="flex flex-col gap-2 rounded-[14px] bg-[#ff8acf12] p-2.5 md:w-full md:max-w-full">
                            <label className="mb-1.5 min-w-max text-base font-bold whitespace-nowrap text-[#2d3748]">
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
                                className="items-select box-border resize-none rounded-xl border-2 border-[#e2e8f0] bg-white px-4 py-3 font-[Kanit] text-[1.1rem]"
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
                    </>
                )}

                <div className="flex flex-col gap-2 rounded-[14px] bg-[#ff8acf12] p-2.5">
                    <label className="mb-1.5 min-w-max text-base font-bold whitespace-nowrap text-[#2d3748] md:w-full md:max-w-full">
                        Work Type *
                    </label>
                    <select
                        value={workType}
                        onChange={e => setWorkType(e.target.value)}
                        className="box-border resize-none rounded-xl border-2 border-[#e2e8f0] bg-white px-4 py-3 font-[Kanit] text-[1.1rem]"
                    >
                        <option>Group</option>
                        <option>Personal</option>
                        <option>School Event</option>
                        <option>School Exam</option>
                    </select>
                </div>
            </div>

            <div className="mt-[20px] mb-[20px] flex flex-col gap-[8px] rounded-[14px] bg-[#ff8a???cf12] p-[10px] md:w-full md:max-w-full">
                M
                <label className="mb-1.5 min-w-auto text-base font-bold whitespace-nowrap text-[#2d3748]">
                    What to finish *
                </label>
                <textarea
                    value={wtf}
                    onChange={e => setWtf(e.target.value)}
                    placeholder="What to finish"
                    className="font-kanit md box-border min-h-[180px] resize-none rounded-2xl border-2 border-[#e2e8f0] bg-white px-4 py-3 text-base focus:border-[#69bcff] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)] focus:outline-none md:w-full md:rounded-md md:border-2 md:border-[#ccc] md:p-2.5"
                    rows={9}
                />
            </div>

            <button
                onClick={handleSubmit}
                className="focus:ring-opacity-50 rounded-xl bg-[#69bcff] px-5 py-2 text-base font-semibold text-white transition-colors duration-200 hover:cursor-pointer hover:bg-blue-600 focus:outline-none"
            >
                Add Task
            </button>
        </div>
    );
}
