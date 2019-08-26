import React from "react";
import { Row, Col } from "react-grid-system";
import { Select } from "./common/Select";
import { Slider } from "./common/Slider";
import { ColorPicker } from "./common/ColorPicker";
import { LabeledInput } from "./common/LabeledInput";
import { store } from "../store/Store";
import { guitarTuning } from "../utils/MusicTheory/Guitar";
import { asOption } from "../utils/other";
import { Toggle } from "./common/Toggle";

const tunings = ["open"].map(asOption);

export const MiscellaneousSettingsPane: React.FunctionComponent = props => {
  const [state, dispatch] = store.useStateHook();

  return (
    <>
      <Row>
        <Col>
          <h2>Miscellaneous</h2>
        </Col>
      </Row>
      <LabeledInput label='Tuning'>
        <Select
          name='tuning'
          options={tunings}
          defaultValue={state.preview.guitar.tuning}
          onChange={e =>
            dispatch({
              type: "CHANGE_TUNNING",
              tuning: e.target.value as guitarTuning
            })
          }
        />
      </LabeledInput>

      <LabeledInput label='Frets'>
        <Slider
          name='frets'
          min={21}
          max={29}
          value={state.preview.guitar.fretboard.frets}
          onChange={e => null}
        />
      </LabeledInput>

      <LabeledInput label='Strings'>
        <Toggle states={["6", "7"]} />
      </LabeledInput>

      <Row nogutter>
        <Col>
          <h3>Colors</h3>
        </Col>
      </Row>

      <LabeledInput label='Fretboard Color'>
        <ColorPicker
          color={state.preview.colors.fretboard}
          onChange={color =>
            dispatch({ type: "CHANGE_COLOR", object: "fretboard", color })
          }
        />
      </LabeledInput>

      <LabeledInput label='Note Color'>
        <ColorPicker
          color={state.preview.colors.note}
          onChange={color =>
            dispatch({ type: "CHANGE_COLOR", object: "note", color })
          }
        />
      </LabeledInput>

      <LabeledInput label='Root Note Color'>
        <ColorPicker
          color={state.preview.colors.rootNote}
          onChange={color =>
            dispatch({ type: "CHANGE_COLOR", object: "rootNote", color })
          }
        />
      </LabeledInput>
    </>
  );
};
