import React, { useState } from "react";
import { SketchPicker, RGBColor } from "react-color";

const styles = {
  color: (color: HexColor) => ({
    width: "36px",
    height: "14px",
    borderRadius: "2px",
    background: color
  }),
  swatch: {
    padding: "5px",
    background: "#fff",
    borderRadius: "1px",
    boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
    display: "inline-block",
    cursor: "pointer"
  },
  popover: {
    position: "absolute",
    zIndex: "2"
  },
  cover: {
    position: "fixed",
    top: "0px",
    right: "0px",
    bottom: "0px",
    left: "0px"
  }
};

type HexColor = string;

interface ColorPickerProps {
  color: HexColor;
  onChange: (newColor: HexColor) => void;
}

export const ColorPicker: React.FunctionComponent<ColorPickerProps> = ({
  color,
  onChange
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div style={styles.swatch} onClick={() => setVisible(true)}>
        <div style={styles.color(color)} />
      </div>
      {visible ? (
        <div style={styles.popover as any}>
          <div style={styles.cover as any} onClick={() => setVisible(false)} />
          <SketchPicker color={color} onChange={e => onChange(e.hex)} />
        </div>
      ) : null}
    </div>
  );
};
