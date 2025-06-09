import React, { useState } from "react";
import { DatePickerInput } from "../Materials";

type Task = {
  dueDate: string;
  teacher: string;
  subject: string;
  workType: string;
  whatToFinish: string;
};

const TaskReportComponent: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(getCurrentDate());
  const [endDate, setEndDate] = useState<string>(getDatePlusDays(7));
  const [tasks, setTasks] = useState<Task[]>([
    {
      dueDate: "09.06.2025",
      teacher: "xxxx",
      subject: "xxxx",
      workType: "Group",
      whatToFinish: "1. xxxxxxxxxxxxxxxxxxxxxxxx",
    },
    {
      dueDate: "09.06.2025",
      teacher: "xx",
      subject: "xxxx",
      workType: "Personal",
      whatToFinish: "2. xxxxxxxxx",
    },
    {
      dueDate: "09.06.2025",
      teacher: "xxx",
      subject: "xxxx",
      workType: "Group",
      whatToFinish: "3. xxxxxxxx",
    },
    {
      dueDate: "10.06.2025",
      teacher: "xxx",
      subject: "xxxx",
      workType: "Personal",
      whatToFinish: "1. ttttt",
    },
  ]);

  // ฟังก์ชันสำหรับรับวันที่ปัจจุบัน
  function getCurrentDate(): string {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  // ฟังก์ชันสำหรับรับวันที่ปัจจุบัน + จำนวนวันที่ต้องการ
  function getDatePlusDays(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split("T")[0];
  }

  // ฟังก์ชันสำหรับค้นหาตามช่วงวันที่
  const handleSearch = () => {
    // ในตัวอย่างนี้เราใช้ข้อมูลจำลอง แต่ในการใช้งานจริงคุณอาจจะต้องดึงข้อมูลจาก API หรือ state อื่นๆ
    console.log(`Searching tasks between ${startDate} and ${endDate}`);
  };

  return (
    <div className="task-report-container">
      <h2 className="title">105 For Task Information</h2>
      
      <div className="search-section">
        <div className="date-range">
          <div className="date-field">
            <span>Date From</span>
            <DatePickerInput
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="date-hint">(Default Current Date)</span>
          </div>
          
          <div className="date-field">
            <span>Date To</span>
            <DatePickerInput
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <span className="date-hint">(Default Current Date +7)</span>
          </div>
        </div>
        
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>
      
      <div className="report-table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th>Due Date</th>
              <th>Subject</th>
              <th>Teacher</th>
              <th>What to Finish</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <tr key={index}>
                <td>{task.dueDate}</td>
                <td>{task.subject}</td>
                <td>{task.teacher}</td>
                <td>{task.whatToFinish}</td>
                <td>{task.workType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskReportComponent;