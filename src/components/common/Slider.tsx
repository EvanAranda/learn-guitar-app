import React from "react";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Slider: React.FunctionComponent<SliderProps> = props => (
  <div>
    <input type='range' {...props} />
    <span>{props.value}</span>
  </div>
);
