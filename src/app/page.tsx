'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskForm from '@/Components/TaskForm';
import TaskList from '@/Components/TaskList';

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedIn');
    if (!loggedIn) {
      router.push('/Logins');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='p-4"'>
      <h1 className="title">Program EP105 - ฉันรักการบ้านที่ซู้ด V1.0</h1>
      <h2 className="title">Class Room EP105</h2>      <TaskForm />
      <TaskList />
    </div>
  );
}
