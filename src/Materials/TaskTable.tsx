import React from 'react';

type Task = {
    dueDate: string;
    subject: string;
    teacher: string;
    whatToFinish: string;
    workType: string;
};

type Props = {
    tasks: Task[];
    onDelete: (index: number) => void;
    onEdit?: (index: number) => void;
};

const TaskTable: React.FC<Props> = ({ tasks, onDelete, onEdit }) => (
    <table className="task-table">
        <thead>
            <tr>
                <th>Due Date</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>What to Finish</th>
                <th>Type</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {tasks.map((task, i) => (
                <tr key={i}>
                    <td>{task.dueDate}</td>
                    <td>{task.subject}</td>
                    <td>{task.teacher}</td>
                    <td>{task.whatToFinish}</td>
                    <td>{task.workType}</td>
                    <td>
                        <button onClick={() => onEdit?.(i)}>Change</button>
                        <button onClick={() => onDelete(i)}>Delete</button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default TaskTable;
