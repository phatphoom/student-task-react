import TaskForm from "@/Components/TaskForm";
import TaskList from "@/Components/TaskList";

export default function Page() {
  return (
    <div>
      <h1 className="title">MANAGE STUDENT TASK</h1>
      <TaskForm />
      <TaskList />
    </div>
  );
}
