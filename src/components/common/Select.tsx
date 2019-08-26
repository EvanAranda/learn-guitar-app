import React from "react";

interface SelectOption {
  id: string;
  title: string;
}

interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
}

export const Select: React.FunctionComponent<Props> = ({
  options,
  ...rest
}) => (
  <select {...rest}>
    {options &&
      options.map(opt => (
        <option key={opt.id} {...opt}>
          {opt.title}
        </option>
      ))}
  </select>
);
