import React from "react";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
};

const TeacherSelect: React.FC<Props> = ({ value, onChange, options }) => (
  <select value={value} onChange={onChange}>
    <option value="">Select Teacher</option>
    {options.map((opt, idx) => (
      <option key={idx} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

export default TeacherSelect;
