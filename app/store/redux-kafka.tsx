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
import throttle from 'lodash.throttle';

import { CLIENT_ID } from '~/util/constants';

type BaseAction = {
  type: string;
  payload?: unknown;
};

export type BaseKafkaAction = {
  index: number;
  client: string;
  type: string;
  payload?: unknown;
};

export type Reducer<State, Action extends BaseAction> = (state: State, action: Action) => State;
export type Dispatch<Action extends BaseAction> = (action: Action) => void;

function getKey<Action extends BaseKafkaAction>(action: Action) {
  return `${action.index}:${action.client}`;
}

// // TODO: It would be much safer to move these into a common provider instead
// // of abusing global scope.
// const ALL_ACTIONS: Record<string, BaseKafkaAction> = {};
// const EVENT_SOURCE_POOL: { [key: string]: EventSource } = {};

let ACTION_QUEUE: [string, BaseKafkaAction][] = [];

const flushActions = throttle(
  async () => {
    // no-op if queue is empty
    if (ACTION_QUEUE.length === 0) return;

    const actions = ACTION_QUEUE;
    ACTION_QUEUE = [];

    try {
      await fetch('/dispatch', {
        method: 'POST',
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actions),
      });
    } catch (error) {
      console.error(error);

      // push failed actions back into queue
      ACTION_QUEUE = actions.concat(ACTION_QUEUE);
    }
  },
  100,
  { leading: false },
);

export function createStore<State, Action extends BaseAction>(
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
    const actions = useRef<Record<string, BaseKafkaAction>>({});
    const animationFrameCallback = useRef(-1);
    const [state, setState] = useState(init);

    // get the most recent kafka index consumed by this client
    const getCursor = useCallback(() => {
      const keys = Object.keys(actions.current);
      keys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const last = keys[keys.length - 1];
      if (!last) return 0;
      return Number.parseInt(last.split(':')[0]);
    }, []);

    // rebuild state and trigger a re-render
    const rebuildState = useCallback(() => {
      const keys = Object.keys(actions.current);
      keys.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      const sortedActions = keys.map((key) => actions.current[key]);
      // @ts-expect-error (use BaseAction as BaseKafkaAction)
      const state = sortedActions.reduce(reducer, init) as State;
      setState(state);
    }, []);

    // push an action into the actions ref
    const pushAction = useCallback(
      (action: BaseKafkaAction) => {
        const key = getKey(action);
        if (!actions.current[key]) {
          actions.current[key] = action;
        } else {
          console.debug('dropped action with duplicate key', action);
        }
        // rebuild state before next render
        window.cancelAnimationFrame(animationFrameCallback.current);
        animationFrameCallback.current = window.requestAnimationFrame(rebuildState);
      },
      [rebuildState],
    );

    // public facing 'dispatch' function
    const dispatch = useCallback(
      (action: Action) => {
        const cursor = getCursor();
        const kafkaAction = {
          ...action,
          index: cursor + 1,
          client: CLIENT_ID,
        };

        // optimistically update UI
        pushAction(kafkaAction);

        // enqueue action to be flushed to server
        ACTION_QUEUE.push([props.KEY, kafkaAction]);
        flushActions();
      },
      [props.KEY, getCursor, pushAction],
    );

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
          pushAction(action);
        });
      };

      eventSource.addEventListener(props.KEY, handleEvent);

      return () => {
        eventSource.removeEventListener(props.KEY, handleEvent);
        eventSource.close();
      };
    }, [props.KEY, pushAction, rebuildState]);

    return (
      <StoreContext.Provider value={{ dispatch, state }}>{props.children}</StoreContext.Provider>
    );
  };

  const useStore = () => {
    return useContext(StoreContext);
  };

  return { Provider, useStore };
}
