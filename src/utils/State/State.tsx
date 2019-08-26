import React, { createContext, useContext, useReducer } from "react";
import uniq from "lodash/uniq";

export interface Middleware<S, A extends Action<T>, T = A["type"]> {
  (oldState: Readonly<S>, action: A, newState: S): void;
}

export interface Action<T = string> {
  type: T;
}

export type ActionTypes<A extends Action> = A["type"];

export type Thunk<A> = (dispatcher: React.Dispatch<A>) => Promise<void>;
export type Dispatch<A> = (action: A | Thunk<A>) => Promise<void>;

/**
 * Responds to a particular event
 */
export interface ActionListener<S, A extends Action<T>, T = A["type"]>
  extends Middleware<S, A, T> {}

export interface SubcriptionSettings<S, A extends Action<T>, T = A["type"]> {
  type?: T | T[];
  listener: ActionListener<S, A, T>;
}

export interface Unsubscriber {
  (): void;
}

export class Store<S, A extends Action<T>, T = A["type"]> {
  private context: React.Context<[S, React.Dispatch<A>]>;
  private reducer: React.Reducer<S, A>;
  private initialState: S;
  private listeners = new Map<ActionListener<S, A, T>, T[]>();
  private middleware: Middleware<S, A, T>[] = [];

  private frozen = false;

  constructor(
    reducer: React.Reducer<S, A>,
    initialState: S,
    middleware?: (() => Middleware<S, A, T>)[]
  ) {
    // @ts-ignore
    this.context = createContext();
    this.initialState = initialState;

    if (middleware !== undefined) {
      for (let f of middleware) {
        this.middleware.push(f());
      }
    }

    /** Extends the reducer to apply middleware */
    this.reducer = (oldState: S, action: A) => {
      if (this.frozen) return oldState;
      this.frozen = true;

      const newState = reducer(oldState, action);

      /**
       * Apply middleware first
       */
      this.middleware.forEach(mw => mw(oldState, action, newState));

      /**
       * Call listeners
       */
      for (let [listener, actions] of this.listeners) {
        if (actions.length === 0 || actions.includes(action.type)) {
          try {
            listener(oldState, action, newState);
          } catch (error) {
            // some uncaught client listener error
          }
        }
      }

      this.frozen = false;
      return newState;
    };
  }

  public subscribe({
    type,
    listener
  }: SubcriptionSettings<S, A, T>): Unsubscriber {
    let subscribedActions: T[] = [];
    if (this.listeners.has(listener)) {
      subscribedActions.push(...this.listeners.get(listener));
    }

    if (type !== undefined) {
      if (typeof type === "string") {
        subscribedActions.push(type);
      } else {
        subscribedActions.push(...type);
      }
    }

    this.listeners.set(listener, uniq(subscribedActions));

    return () => {
      this.unsubscribe({ type, listener });
    };
  }

  public unsubscribe({ type, listener }: SubcriptionSettings<S, A, T>): void {}

  public Provider() {
    const StateContext = this.context;
    const reducer = this.reducer;
    const initialState = this.initialState;

    return (props: { children: React.ReactNode }) => (
      <StateContext.Provider value={useReducer(reducer, initialState)}>
        {props.children}
      </StateContext.Provider>
    );
  }

  public useStateHook(): [S, Dispatch<A>] {
    let [state, dispatch] = useContext(this.context);

    // wrap dispatch to accept thunks
    let dispatchThunk: Dispatch<A> = action => {
      if (typeof action === "function") {
        return action(dispatch);
      } else {
        dispatch(action);
        return Promise.resolve();
      }
    };

    return [state, dispatchThunk];
  }
}
