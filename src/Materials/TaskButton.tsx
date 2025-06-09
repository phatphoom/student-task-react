import React from "react";

type TaskButtonProps = {
  onClick: () => void;
};

const TaskButton: React.FC<TaskButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="task-button">
      Add
    </button>
  );
};

export default TaskButton;
