/**
 * Implements a redux-like interface for managing *server* state!
 *
 * See also ./redux-lite.tsx which shares the same interface.
 *
 * Unique properties of redux-kafka:
 *
 * 1. Actions are immediately pushed upstream to Kafka
 * 2. Subscribes to Kafka event stream
 * 2. Final state is derived by replaying kafka events
 *
 * @example
 *  export const {Provider, useContext} = createStore(
 *    '/kafka/sse',
 *    reducer,
 *    init,
 *  )
 */
import { createContext, ReactNode, useContext } from 'react';
import { useEventSourceReducer } from './useEventSourceReducer';
import { useKafkaAction } from './useKafkaAction';

export type Reducer<State, Action> = (state: State, action: Action) => State;
export type Dispatch<Action> = (action: Action) => void;

export function createStore<State, Action>(
  resource: string,
  reducer: Reducer<State, Action>,
  init: State,
) {
  const StoreContext = createContext<{
    dispatch: Dispatch<Action>;
    state: State;
  }>({ dispatch: () => {}, state: init });

  const Provider = (props: { reducer?: Reducer<State, Action>; children: ReactNode }) => {
    const dispatch = useKafkaAction(resource);
    const state = useEventSourceReducer(resource, 'ACTION', reducer, init);

    return (
      <StoreContext.Provider value={{ dispatch, state }}>{props.children}</StoreContext.Provider>
    );
  };

  const useStoreContext = () => {
    return useContext(StoreContext);
  };

  return { Provider, useContext: useStoreContext };
}
