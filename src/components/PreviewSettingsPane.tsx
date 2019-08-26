import React from "react";
import * as Mode from "@tonaljs/mode";
import { store } from "../store/Store";
import { asOption } from "../utils/other";
import { Row, Col } from "react-grid-system";
import { LabeledInput } from "./common/LabeledInput";
import { Select } from "./common/Select";
import { Check } from "./common/Check";

const modes = ["", ...Mode.entries().map(mode => mode.name)].map(asOption);
const notes = ["", "A", "B", "C", "D", "E", "F", "G"].map(asOption);

export const PreviewSettingsPane: React.FunctionComponent = props => {
  const [state, dispatch] = store.useStateHook();

  return (
    <>
      <Row>
        <Col xs={12}>
          <h2>Controls</h2>
        </Col>
      </Row>
      <LabeledInput label='Mode'>
        <Select
          name='mode'
          options={modes}
          value={state.controls.mode}
          onChange={e =>
            dispatch({ type: "CHANGE_MODE", mode: e.target.value })
          }
        />
      </LabeledInput>
      <LabeledInput label='Root Note'>
        <Select
          name='rootNote'
          options={notes}
          value={state.controls.rootNote}
          onChange={e =>
            dispatch({ type: "CHANGE_ROOT_NOTE", rootNote: e.target.value })
          }
        />
      </LabeledInput>

      <LabeledInput label='Highlight Shape'>
        <Check
          name='highlightShape'
          checked={state.controls.highlightModeShape}
          onChange={e =>
            dispatch({ type: "HIGHLIGHT_SHAPE", bool: e.target.checked })
          }
        />
      </LabeledInput>
    </>
  );
};
