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
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useFetcher } from '@remix-run/react';
import { CLIENT_ID } from '../util/constants';

type BaseAction = {
  type: string;
  payload?: any;
};

type BaseKafkaAction = {
  index: number;
  client: string;
  type: string;
  payload?: any;
};

export type Reducer<State, Action extends BaseAction> = (state: State, action: Action) => State;
export type Dispatch<Action extends BaseAction> = (action: Action) => void;

function getKey<Action extends BaseKafkaAction>(action: Action) {
  return `${action.index}:${action.client}`;
}

export function createStore<State, Action extends BaseKafkaAction>(
  resource: string,
  reducer: Reducer<State, Action>,
  init: State,
) {
  const StoreContext = createContext<{
    dispatch: Dispatch<Action>;
    state: State;
  }>({ dispatch: () => {}, state: init });
  const Provider = (props: {
    reducer?: Reducer<State, Action>;
    children: ReactNode;
    KEY: string;
  }) => {
    const actions = useRef<Record<string, Action>>({});
    const animationFrameCallback = useRef(-1);
    const fetcher = useFetcher();
    const [state, setState] = useState(init);

    // get the most recent kafka index consumed by this client
    const getCursor = useCallback(() => {
      const keys = Object.keys(actions.current);
      keys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const last = keys[keys.length - 1];
      return Number.parseInt(last.split(':')[0]);
    }, []);

    // rebuild state and trigger a re-render
    const rebuildState = useCallback(() => {
      const keys = Object.keys(actions.current);
      keys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const sortedActions = keys.map((key) => actions.current[key]);
      const state = sortedActions.reduce(reducer, init);
      setState(state);
    }, []);

    // push an action into the actions ref
    const pushAction = useCallback(
      (action: Action) => {
        const key = getKey(action);
        if (!actions.current[key]) {
          actions.current[key] = action;
          window.cancelAnimationFrame(animationFrameCallback.current);
          animationFrameCallback.current = window.requestAnimationFrame(rebuildState);
          console.log(actions.current);
        }
      },
      [rebuildState],
    );

    // public facing 'dispatch' function
    const dispatch = useCallback((action: Action) => {
      const cursor = getCursor();
      action.index = cursor + 1;
      action.client = CLIENT_ID;

      // optimistically update UI
      pushAction(action);

      fetcher.submit(
        {
          key: props.KEY,
          ...action,
          payload: JSON.stringify(action.payload),
        },
        { method: 'POST', action: resource },
      );
    }, []);

    // subscribe to kafka events
    useEffect(() => {
      const eventSource = new EventSource(`${resource}?key=${props.KEY}`);
      const handleEvent = (event: MessageEvent<string>) => {
        // parse batch
        const actions = JSON.parse(event.data);
        actions.forEach((a: string) => {
          const action = JSON.parse(a);
          if (action.index == null || action.client == null) {
            return;
          }
          action.payload = JSON.parse(action.payload);
          pushAction(action);
        });
      };

      eventSource.addEventListener(props.KEY, handleEvent);
      return () => {
        eventSource.removeEventListener(props.KEY, handleEvent);
        eventSource.close();
      };
    }, [pushAction]);

    return (
      <StoreContext.Provider value={{ dispatch, state }}>{props.children}</StoreContext.Provider>
    );
  };

  const useStoreContext = () => {
    return useContext(StoreContext);
  };

  return { Provider, useContext: useStoreContext };
}
