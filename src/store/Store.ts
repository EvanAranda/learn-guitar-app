import {
  Store,
  LoggerMiddleware,
  PersistentStateMiddleware
} from "../utils/State";
import {
  PreviewActions,
  PreviewState,
  previewReducer,
  initialPreviewState
} from "./PreviewStore";
import {
  ControlActions,
  ControlState,
  initialControlState,
  controlsReducer
} from "./ControlsStore";

export type Point = [number, number];

export interface State {
  preview: PreviewState;
  controls: ControlState;
}

export type Actions = PreviewActions | ControlActions;

const reducer: React.Reducer<State, Actions> = (
  { preview, controls },
  action
) => ({
  preview: previewReducer(preview, action as PreviewActions),
  controls: controlsReducer(controls, action as ControlActions)
});

const initialState: State = {
  preview: initialPreviewState,
  controls: initialControlState
};

const getLocalState = (name: string): State | undefined => {
  let storedState: State | undefined;
  try {
    let stringState = localStorage.getItem(name);
    storedState = stringState ? JSON.parse(stringState) : undefined;
  } catch (err) {}

  return storedState;
};

export const store = new Store<State, Actions>(
  reducer,
  getLocalState("app") || initialState,
  [LoggerMiddleware, PersistentStateMiddleware("app")]
);
