import { Point } from "./Store";
import { guitarTuning } from "../utils/MusicTheory/Guitar";

export interface ChangeMode {
  type: "CHANGE_MODE";
  mode: string;
}

export interface ChangeRootNote {
  type: "CHANGE_ROOT_NOTE";
  rootNote: string;
}

export interface HighlightModeShape {
  type: "HIGHLIGHT_SHAPE";
  bool: boolean;
}

export type ControlActions = ChangeMode | ChangeRootNote | HighlightModeShape;

export interface ControlState {
  mode: string;
  rootNote: string;
  highlightModeShape: boolean;
}

export const initialControlState: ControlState = {
  mode: "",
  rootNote: "",
  highlightModeShape: true
};

export const controlsReducer: React.Reducer<ControlState, ControlActions> = (
  state,
  action
) => {
  switch (action.type) {
    case "CHANGE_MODE":
      return {
        ...state,
        mode: action.mode
      };
    case "CHANGE_ROOT_NOTE":
      return {
        ...state,
        rootNote: action.rootNote
      };
    case "HIGHLIGHT_SHAPE":
      return { ...state, highlightModeShape: action.bool };
    default:
      return state;
  }
};
