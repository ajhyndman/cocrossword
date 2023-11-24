import throttle from 'lodash.throttle';
import { type ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { v4 } from 'uuid';

// - server reducer
// - client reducer (isolated)
// - unified provider
// - unified or split useState?
// - unified selectors / queries?
// - SSR support
// - server provides initial state
// - optimistic update + merge algorithm
// - "command" executor

// can be split off
// - client state / reducer
// - selectors
// - "commands" or "actions"

interface BaseAction {
  type: string;
  payload?: unknown;
}

interface RemoteAction extends BaseAction {
  id: string;
}

export type Reducer<State, E extends BaseAction> = (state: State, event: E) => State;
export type Dispatch<E extends BaseAction> = (event: E) => void;
export type Executor<
  LocalState,
  RemoteState,
  Command extends BaseAction,
  LocalEvent extends BaseAction,
  RemoteEvent extends RemoteAction,
> = (
  state: { local: LocalState; remote: RemoteState },
  command: Command,
  dispatchLocal: Dispatch<LocalEvent>,
  dispatchRemote: Dispatch<Pick<RemoteEvent, 'type' | 'payload'>>,
) => void;
export type Execute<Command extends BaseAction> = (command: Command) => void;
export type Subscriber<LocalState, RemoteState> = (state: {
  local: LocalState;
  remote: RemoteState;
}) => void;
export type SubscribeToServer<RemoteEvent> = (
  key: string,
  subscriber: (event: RemoteEvent) => void,
) => () => void;

class Store<
  Command extends BaseAction,
  LocalEvent extends BaseAction,
  RemoteEvent extends RemoteAction,
  LocalState extends Record<string, never>,
  RemoteState extends Record<string, never>,
> {
  // "command" handler

  private executor: Executor<LocalState, RemoteState, Command, LocalEvent, RemoteEvent>;

  // local-only state
  private localReducer: Reducer<LocalState, LocalEvent>;
  private localState: LocalState;

  // server-validated remote state
  private remoteReducer: Reducer<RemoteState, RemoteEvent>;
  private remoteState: RemoteState;

  // optimistic updates
  private optimisticEvents: RemoteEvent[] = [];

  private subscribers: Set<Subscriber<LocalState, RemoteState>> = new Set();

  // flush to server
  private remoteEventBuffer: [string, RemoteEvent][] = [];
  private flushToServer: (events: [string, RemoteEvent][]) => void;

  constructor(
    executor: Executor<LocalState, RemoteState, Command, LocalEvent, RemoteEvent>,
    localReducer: Reducer<LocalState, LocalEvent>,
    remoteReducer: Reducer<RemoteState, RemoteEvent>,
    initLocal: LocalState = {} as LocalState,
    initRemote: RemoteState = {} as RemoteState,
    flushToServer: (events: [string, RemoteEvent][]) => void,
  ) {
    this.executor = executor;
    this.localReducer = localReducer;
    this.localState = initLocal;
    this.remoteReducer = remoteReducer;
    this.remoteState = initRemote;
    this.flushToServer = flushToServer;
    this.flush = throttle(this.flush, 100, { leading: false });
  }

  private next() {
    const state = this.getSnapshot();
    // notify subscriber of latest changes
    this.subscribers.forEach((subscriber) => subscriber(state));
  }

  private flush() {
    // no-op if queue is empty
    if (this.remoteEventBuffer.length === 0) return;

    const events = this.remoteEventBuffer;
    this.remoteEventBuffer = [];
    try {
      this.flushToServer(events);
    } catch (error) {
      console.error(error);

      // push failed actions back into queue
      this.remoteEventBuffer = events.concat(this.remoteEventBuffer);
    }
  }

  private pushRemoteEvent(key: string, event: RemoteEvent) {
    this.remoteEventBuffer.push([key, event]);
    this.flush();
  }

  private dispatchLocal: Dispatch<LocalEvent> = (event) => {
    this.localState = this.localReducer(this.localState, event);
    this.next();
  };

  private optimisticDispatchRemote =
    (key: string): Dispatch<Pick<RemoteEvent, 'type' | 'payload'>> =>
    (event) => {
      const remoteEvent = { ...event, id: v4() } as RemoteEvent;
      // optimistic update
      this.optimisticEvents.push(remoteEvent);
      // flush to server
      this.pushRemoteEvent(key, remoteEvent);

      this.next();
    };

  /**
   * Push new events recieved from server into this store
   */
  serverDispatch: Dispatch<RemoteEvent> = (event) => {
    // update remote state snapshot
    this.remoteState = this.remoteReducer(this.remoteState, event);
    // remove event (if present) from optimistic updates
    this.optimisticEvents = this.optimisticEvents.filter(({ id }) => id !== event.id);

    this.next();
  };

  getSnapshot = () => {
    // always replay yet-unvalidated events on top of latest verified remote state
    const remoteState = this.optimisticEvents.reduce(this.remoteReducer, this.remoteState);
    return { local: this.localState, remote: remoteState };
  };

  subscribe = (subscriber: Subscriber<LocalState, RemoteState>) => {
    this.subscribers.add(subscriber);
    return () => void this.subscribers.delete(subscriber);
  };

  execute =
    (key: string): Execute<Command> =>
    (command) => {
      this.executor(
        { local: this.localState, remote: this.remoteState },
        command,
        this.dispatchLocal,
        this.optimisticDispatchRemote(key),
      );
    };
}

export function createStore<
  Command extends BaseAction,
  LocalEvent extends BaseAction,
  RemoteEvent extends RemoteAction,
  LocalState extends Record<string, never>,
  RemoteState extends Record<string, never>,
>(
  executor: Executor<LocalState, RemoteState, Command, LocalEvent, RemoteEvent>,
  localReducer: Reducer<LocalState, LocalEvent>,
  remoteReducer: Reducer<RemoteState, RemoteEvent>,
  initLocal: LocalState = {} as LocalState,
  initRemote: RemoteState = {} as RemoteState,
  flushToServer: (events: [string, RemoteEvent][]) => void,
  subscribeToServer: SubscribeToServer<RemoteEvent>,
) {
  // init store ????
  const store = new Store(
    executor,
    localReducer,
    remoteReducer,
    initLocal,
    initRemote,
    flushToServer,
  );

  // build context
  const StoreContext = createContext<{ key: string; store: typeof store }>({
    key: 'UNKNOWN',
    store,
  });

  // build provider
  function Provider(props: { KEY: string; children: ReactNode }) {
    useEffect(() => {
      const cleanup = subscribeToServer(props.KEY, (event) => {
        store.serverDispatch(event);
      });
      return cleanup;
    }, [props.KEY]);

    return (
      <StoreContext.Provider value={{ key: props.KEY, store }}>
        {props.children}
      </StoreContext.Provider>
    );
  }

  // build hooks
  function useExecute() {
    const { key, store } = useContext(StoreContext);
    return store.execute(key);
  }

  function useSelector<T>(selector: (state: { local: LocalState; remote: RemoteState }) => T): T {
    const { store } = useContext(StoreContext);

    const [value, setValue] = useState<T>(() => {
      const snapshot = store.getSnapshot();
      return selector(snapshot);
    });

    useEffect(() => {
      const unsubscribe = store.subscribe(({ local, remote }) => {
        // *only* update state if value has changed
        const nextValue = selector({ local, remote });
        if (value !== nextValue) {
          setValue(nextValue);
        }
      });

      return unsubscribe;
    }, [selector, store, value]);

    return value;
  }

  // return hooks & provider
  return { Provider, useExecute, useSelector };
}
