import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DatePickerInput,
  TeacherSelect,
  SubjectSelect,
  WorkTypeSelect,
  DescriptionTextarea,
  SidebarMenu,
  TaskButton,
  TaskTable,
} from "../Materials";

type Task = {
  dueDate: string;
  teacher: string;
  subject: string;
  workType: string;
  whatToFinish: string;
};

const StudentTaskManager: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"manage" | "report">("manage");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState<Task>({
    dueDate: "",
    teacher: "",
    subject: "",
    workType: "",
    whatToFinish: "",
  });

  // ข้อมูลตัวอย่าง
  const teachers = ["อาจารย์ A", "อาจารย์ B", "อาจารย์ C"];
  const subjects = ["คณิตศาสตร์", "ภาษาอังกฤษ", "วิทยาศาสตร์", "สังคมศึกษา"];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddTask = () => {
    // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
    if (
      !formData.dueDate ||
      !formData.teacher ||
      !formData.subject ||
      !formData.workType ||
      !formData.whatToFinish
    ) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // เพิ่มงานใหม่
    setTasks([...tasks, formData]);

    // รีเซ็ตฟอร์ม
    setFormData({
      dueDate: "",
      teacher: "",
      subject: "",
      workType: "",
      whatToFinish: "",
    });
  };

  const handleDeleteTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
  };

  const handleEditTask = (index: number) => {
    // ตั้งค่าข้อมูลฟอร์มเป็นข้อมูลของงานที่ต้องการแก้ไข
    setFormData(tasks[index]);
    
    // ลบงานเดิม
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
  };

  // เพิ่มฟังก์ชันสำหรับนำทางไปยังหน้า Reports
  const navigateToReports = () => {
    router.push("/Reports");
  };

  return (
    <div className="student-task-container">
      <div className="header">
        <h2 className="title">105 - For Student Manage Task</h2>
      </div>

      <div className="main-content">
        <div className="sidebar">
          <SidebarMenu
            onManageClick={() => setActiveTab("manage")}
            onReportClick={navigateToReports}
          />
        </div>

        <div className="content">
          {activeTab === "manage" && (
            <div className="manage-form">
              <div className="form-group">
                <label>Due Date</label>
                <DatePickerInput
                  value={formData.dueDate}
                  onChange={(e) =>
                    handleInputChange({ ...e, target: { ...e.target, name: "dueDate" } })
                  }
                />
              </div>

              <div className="form-group">
                <label>Teacher</label>
                <TeacherSelect
                  value={formData.teacher}
                  onChange={(e) =>
                    handleInputChange({ ...e, target: { ...e.target, name: "teacher" } })
                  }
                  options={teachers}
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <SubjectSelect
                  value={formData.subject}
                  onChange={(e) =>
                    handleInputChange({ ...e, target: { ...e.target, name: "subject" } })
                  }
                  options={subjects}
                />
              </div>

              <div className="form-group">
                <label>Work Type</label>
                <WorkTypeSelect
                  value={formData.workType}
                  onChange={(e) =>
                    handleInputChange({ ...e, target: { ...e.target, name: "workType" } })
                  }
                />
              </div>

              <div className="form-group">
                <label>What to Finish</label>
                <DescriptionTextarea
                  value={formData.whatToFinish}
                  onChange={(e) =>
                    handleInputChange({ ...e, target: { ...e.target, name: "whatToFinish" } })
                  }
                />
              </div>

              <div className="form-actions">
                <TaskButton onClick={handleAddTask} />
                <div className="action-text">กดปุ่มเพื่อ เพิ่มรายการ</div>
              </div>
            </div>
          )}

          <div className="task-list">
            <TaskTable
              tasks={tasks}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTaskManager;