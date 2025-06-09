import React from "react";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const DatePickerInput: React.FC<Props> = ({ value, onChange }) => (
  <input type="date" value={value} onChange={onChange} />
);

export default DatePickerInput;
 