import { Point } from "./Store";
import { guitarTuning } from "../utils/MusicTheory/Guitar";

export interface MoveBy {
  type: "MOVE_BY";
  delta: Point;
}

export interface MoveTo {
  type: "MOVE_TO";
  position: Point;
}

export interface ChangeTuning {
  type: "CHANGE_TUNNING";
  tuning: guitarTuning;
}

export interface ChangeColor {
  type: "CHANGE_COLOR";
  object: "fretboard" | "note" | "rootNote";
  color: string;
}

export type PreviewActions = MoveBy | MoveTo | ChangeTuning | ChangeColor;

export interface GuitarConfig {
  strings: number;
  fretboard: {
    frets: number;
  };
  tuning: guitarTuning;
}

export interface PreviewState {
  position: Point;
  zoom: number;
  guitar: GuitarConfig;
  colors: {
    fretboard: string;
    note: string;
    rootNote: string;
  };
}

export const initialPreviewState: PreviewState = {
  zoom: 1,
  position: [-1, -1],
  guitar: {
    fretboard: {
      frets: 24
    },
    strings: 6,
    tuning: "open"
  },
  colors: {
    fretboard: "#d9a67a",
    rootNote: "#ffff00",
    note: "#0000ff"
  }
};

const guitarReducer: React.Reducer<GuitarConfig, PreviewActions> = (
  state,
  action
) => {
  switch (action.type) {
    case "CHANGE_TUNNING":
      return { ...state, tuning: action.tuning };
    default:
      return state;
  }
};

export const previewReducer: React.Reducer<PreviewState, PreviewActions> = (
  state,
  action
) => {
  switch (action.type) {
    case "MOVE_BY":
      const [dx, dy] = action.delta;
      const [x, y] = state.position;
      return {
        ...state,
        position: [x + dx, y + dy]
      };
    case "MOVE_TO":
      return { ...state, position: action.position };
    case "CHANGE_TUNNING":
      return {
        ...state,
        guitar: guitarReducer(state.guitar, action)
      };
    case "CHANGE_COLOR":
      return {
        ...state,
        colors: {
          ...state.colors,
          [action.object]: action.color
        }
      };
    default:
      return state;
  }
};
