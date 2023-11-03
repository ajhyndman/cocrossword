/**
 * Implements a redux-like interface for managing client state.
 *
 * There are a few key differences from standard redux and react-redux bindings:
 *
 * 1. Minimal, opinionated interface.
 * 2. No action creators necessary
 * 3. Returns well-typed dispatch and state hooks.
 * 4. Naturally compose multiple stores with React instead of `combineReducers` or `slices`.
 *
 * @example
 *  export const {Provider, useContext} = createStore(
 *    reducer,
 *    init,
 *  )
 */
import { createContext, ReactNode, useContext, useRef, useState } from 'react';

type BaseAction = {
  type: string;
  payload?: any;
};

export type Reducer<State, Action extends BaseAction> = (state: State, action: Action) => State;
export type Dispatch<Action extends BaseAction> = (action: Action) => void;

class Store<State, Action extends BaseAction> {
  private reducer: (state: State, action: Action) => State;
  private state: State;
  private onChange: (state: State) => void;

  constructor(reducer: Reducer<State, Action>, onChange: (state: State) => void, init: State) {
    this.reducer = reducer;
    this.onChange = onChange;
    this.state = init;
  }

  dispatch = (action: Action) => {
    this.state = this.reducer(this.state, action);
    this.onChange(this.state);
  };
}

export function createStore<State, Action extends BaseAction>(
  reducer: Reducer<State, Action>,
  init: State,
) {
  const StoreContext = createContext<{
    dispatch: Dispatch<Action>;
    state: State;
  }>({ dispatch: () => {}, state: init });

  const Provider = (props: { reducer?: Reducer<State, Action>; children: ReactNode }) => {
    const [state, setState] = useState<State>(init);
    const store = useRef(new Store(props.reducer ?? reducer, setState, init));

    return (
      <StoreContext.Provider value={{ dispatch: store.current.dispatch, state }}>
        {props.children}
      </StoreContext.Provider>
    );
  };

  const useStoreContext = () => {
    return useContext(StoreContext);
  };

  return { Provider, useContext: useStoreContext };
}
