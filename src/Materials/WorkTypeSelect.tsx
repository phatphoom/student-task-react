import React from "react";

const options = ["Group", "Personal", "School Event"];

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const WorkTypeSelect: React.FC<Props> = ({ value, onChange }) => (
  <select value={value} onChange={onChange}>
    <option value="">Select Work Type</option>
    {options.map((opt, idx) => (
      <option key={idx} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);

export default WorkTypeSelect;
