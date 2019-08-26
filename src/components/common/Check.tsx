import React from "react";

interface CheckProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Check: React.FunctionComponent<CheckProps> = props => (
  <input type='checkbox' {...props} />
);
