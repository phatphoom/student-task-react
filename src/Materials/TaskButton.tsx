import React from "react";
import Link from "next/link";

type TaskButtonProps = {
  onClick: () => void;
};

const TaskButton: React.FC<TaskButtonProps> = ({ onClick }) => {
  return (
    <Link href="/" className="task-button">Add</Link>
  );
};

export default TaskButton;
