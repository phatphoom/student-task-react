'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskForm from '@/components/TaskForm';
import TaskList from '@/components/TaskList';

export default function Page() {
    const [refresh, setRefresh] = useState(false);
    const [startDate, setStartDate] = useState<string>('');
    const triggerRefresh = () => setRefresh(prev => !prev);
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loggedIn = localStorage.getItem('loggedIn');

        if (!loggedIn) {
            router.push('/');
        } else {
            setLoading(false);

            // ✅ หลังจาก login ผ่านแล้ว ค่อย log access
            const user = localStorage.getItem('adminName');
            const adminId = localStorage.getItem('adminId');

            const logAccess = async () => {
                try {
                    await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/log-access`,
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                menu: 'Manage Due', // 👈 ชื่อเมนูที่ต้องการบันทึก
                                user: user ?? '',
                                admin_id: parseInt(adminId ?? '0'),
                                date_time: new Date().toISOString(),
                            }),
                        },
                    );
                } catch (err) {
                    console.error('Failed to log access:', err);
                }
            };

            logAccess(); // เรียกที่นี่ หลัง setLoading(false)
        }
    }, [router]);
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className='p-4"'>
            <TaskForm
                onTaskAdded={triggerRefresh}
                onDateChange={setStartDate}
            />
            <TaskList
                refreshTrigger={refresh}
                startDate={startDate}
            />
        </div>
    );
}
