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
  key: string;
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
  dispatchRemote: Dispatch<RemoteEvent>,
) => void;
export type Execute<Command extends BaseAction> = (command: Command) => void;
export type Subscriber<LocalState, RemoteState> = (state: {
  local: LocalState;
  remote: RemoteState;
}) => void;

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

  private flushToServer: Dispatch<RemoteEvent>;

  constructor(
    executor: Executor<LocalState, RemoteState, Command, LocalEvent, RemoteEvent>,
    localReducer: Reducer<LocalState, LocalEvent>,
    remoteReducer: Reducer<RemoteState, RemoteEvent>,
    initLocal: LocalState = {} as LocalState,
    initRemote: RemoteState = {} as RemoteState,
    flushToServer: (event: RemoteEvent) => void,
  ) {
    this.executor = executor;
    this.localReducer = localReducer;
    this.localState = initLocal;
    this.remoteReducer = remoteReducer;
    this.remoteState = initRemote;
    this.flushToServer = flushToServer;
  }

  private next() {
    const state = this.getSnapshot();
    // notify subscriber of latest changes
    this.subscribers.forEach((subscriber) => subscriber(state));
  }

  private dispatchLocal: Dispatch<LocalEvent> = (event) => {
    this.localState = this.localReducer(this.localState, event);
    this.next();
  };

  private optimisticDispatchRemote: Dispatch<Pick<RemoteEvent, 'type' | 'payload'>> = (event) => {
    const remoteEvent = { ...event, key: v4() } as RemoteEvent;
    // optimistic update
    this.optimisticEvents.push(remoteEvent);
    // flush to server
    this.flushToServer(remoteEvent);

    this.next();
  };

  /**
   * Push new events recieved from server into this store
   */
  serverDispatch: Dispatch<RemoteEvent> = (event) => {
    // update remote state snapshot
    this.remoteState = this.remoteReducer(this.remoteState, event);
    // remove event (if present) from optimistic updates
    this.optimisticEvents = this.optimisticEvents.filter(({ key }) => key !== event.key);

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

  execute: Execute<Command> = (command) => {
    this.executor(
      { local: this.localState, remote: this.remoteState },
      command,
      this.dispatchLocal,
      this.optimisticDispatchRemote,
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
  flushToServer: Dispatch<RemoteEvent>,
  subscribeToServer: (subscriber: (event: RemoteEvent) => void) => () => void,
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
  const StoreContext = createContext<typeof store>(store);

  // build provider
  function Provider(props: { children: ReactNode }) {
    useEffect(() => {
      const cleanup = subscribeToServer((event) => {
        store.serverDispatch(event);
      });
      return cleanup;
    }, []);

    return <StoreContext.Provider value={store}>{props.children}</StoreContext.Provider>;
  }

  // build hooks
  function useExecute() {
    const store = useContext(StoreContext);
    return store.execute;
  }

  function useSelector<T>(selector: (local: LocalState, remote: RemoteState) => T): T {
    const store = useContext(StoreContext);

    const [value, setValue] = useState<T>(() => {
      const { local, remote } = store.getSnapshot();
      return selector(local, remote);
    });

    useEffect(() => {
      const unsubscribe = store.subscribe(({ local, remote }) => {
        // *only* update state if value has changed
        const nextValue = selector(local, remote);
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
