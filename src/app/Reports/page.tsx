"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import SidebarMenu from "../../Materials/SidebarMenu";
import TaskReportComponent from "../../Components/TaskReportComponent";

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"manage" | "report">("report");

  const navigateToManage = () => {
    router.push("/");
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="student-task-container">
        <div className="sidebar">
          <SidebarMenu
            onManageClick={navigateToManage}
            onReportClick={() => setActiveTab("report")}
          />
        </div>
        <div className="content">
          {activeTab === "report" && <TaskReportComponent />}
        </div>
      </div>
    </main>
  );
}