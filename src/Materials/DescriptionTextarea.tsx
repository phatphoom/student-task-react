import React from "react";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
};

const DescriptionTextarea: React.FC<Props> = ({ value, onChange }) => (
  <textarea value={value} onChange={onChange} />
);

export default DescriptionTextarea;
