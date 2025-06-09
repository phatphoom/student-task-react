import React from "react";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
};

const SubjectSelect: React.FC<Props> = ({ value, onChange, options }) => {
  return (
    <select value={value} onChange={onChange} className="subject-select">
      <option value="" disabled>
        Select subject
      </option>
      {options.map((subject) => (
        <option key={subject} value={subject}>
          {subject}
        </option>
      ))}
    </select>
  );
};

export default SubjectSelect;
