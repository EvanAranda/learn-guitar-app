import "./Toggle.css";
import React from "react";

interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  states: [string, string];
}

export const Toggle: React.FunctionComponent<ToggleProps> = props => (
  <div style={{ display: "flex", flexDirection: "row" }}>
    <span>{props.states[0]}</span>
    <div className='onoffswitch'>
      <input
        type='checkbox'
        name='onoffswitch'
        className='onoffswitch-checkbox'
        id='myonoffswitch'
        checked={props.checked}
      />
      <label className='onoffswitch-label' htmlFor='myonoffswitch'>
        <span className='onoffswitch-inner' />
        <span className='onoffswitch-switch' />
      </label>
    </div>
    <span>{props.states[1]}</span>
  </div>
);
