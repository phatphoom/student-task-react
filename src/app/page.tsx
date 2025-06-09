"use client";
import React from "react";
import StudentTaskManager from "../Components/StudentTaskManager";

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Student Task Manager</h1>
      <StudentTaskManager />
    </main>
  );
}