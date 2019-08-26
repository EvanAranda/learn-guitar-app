import { Action, Middleware } from "./State";

export const LoggerMiddleware = <
  S,
  A extends Action<T>,
  T = A["type"]
>(): Middleware<S, A, T> => (oldState, action, newState) => {
  console.groupCollapsed(
    `[${new Date().toLocaleTimeString()}] Action Type: ${action.type}`
  );
  console.log("old state", oldState);
  console.log("action", action);
  console.log("new state", newState);
  console.groupEnd();
};

export const PersistentStateMiddleware = <
  S,
  A extends Action<T>,
  T = A["type"]
>(
  name: string
) => (): Middleware<S, A, T> => (oldState, action, newState) => {
  if (localStorage) {
    localStorage.setItem(name, JSON.stringify(newState));
  }
};
