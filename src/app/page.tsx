"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TaskForm from "@/Components/TaskForm";
import TaskList from "@/Components/TaskList";

export default function Page() {
  const [refresh, setRefresh] = useState(false);

  const triggerRefresh = () => setRefresh((prev) => !prev);
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (!loggedIn) {
      router.push("/");
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='p-4"'>
      <TaskForm onTaskAdded={triggerRefresh} />
      <TaskList refreshTrigger={refresh} />
    </div>
  );
}
