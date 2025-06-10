import TaskForm from "@/Components/TaskForm";
import TaskList from "@/Components/TaskList";

export default function Page() {
  return (
    <div>
      <h1 className="text-xl font-bold p-4">Manage Student Task</h1>
      <TaskForm />
      <hr className="my-4" />
      <TaskList />
    </div>
  );
}
