import throttle from 'lodash.throttle';
import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
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
  offset: number;
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
  execute: Execute<Command>,
) => void;
export type Execute<Command extends BaseAction> = (command: Command) => void;
export type Subscriber<LocalState, RemoteState> = (state: {
  local: LocalState;
  remote: RemoteState;
}) => void;
export type SubscribeToServer<RemoteEvent> = (
  key: string,
  offset: number,
  subscriber: (event: RemoteEvent) => void,
) => () => void;

class Store<
  Command extends BaseAction,
  LocalEvent extends BaseAction,
  RemoteEvent extends RemoteAction,
  LocalState extends Record<string, never>,
  RemoteState extends Record<string, never>,
> {
  // stream key to subscribe/publish to
  private key: string;

  // the server-defined "offset" of the most-recently-read actions
  private offset: number = 0;

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
    key: string,
    executor: Executor<LocalState, RemoteState, Command, LocalEvent, RemoteEvent>,
    localReducer: Reducer<LocalState, LocalEvent>,
    remoteReducer: Reducer<RemoteState, RemoteEvent>,
    initLocal: LocalState = {} as LocalState,
    initRemote: RemoteState = {} as RemoteState,
    flushToServer: (events: [string, RemoteEvent][]) => void,
  ) {
    this.key = key;
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

  private optimisticDispatchRemote: Dispatch<Pick<RemoteEvent, 'type' | 'payload'>> = (event) => {
    const remoteEvent = { ...event, id: v4() } as RemoteEvent;
    // optimistic update
    this.optimisticEvents.push(remoteEvent);
    // flush to server
    this.pushRemoteEvent(this.key, remoteEvent);

    this.next();
  };

  /**
   * Push new events recieved from server into this store
   */
  onServerEvent = (event: RemoteEvent) => {
    if (event.offset >= this.offset) {
      // update remote state snapshot
      this.remoteState = this.remoteReducer(this.remoteState, event);
      // update offset position
      this.offset = event.offset + 1;
    }
    // remove event (if present) from optimistic updates
    this.optimisticEvents = this.optimisticEvents.filter(({ id }) => id !== event.id);

    this.next();
  };

  getOffset = () => this.offset;

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
      this.execute,
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
  // build context
  const StoreContext = createContext<Store<
    Command,
    LocalEvent,
    RemoteEvent,
    LocalState,
    RemoteState
  > | null>(null);

  // build provider
  function Provider(props: { KEY: string; children: ReactNode }) {
    const store = useMemo(() => {
      // init store
      return new Store(
        props.KEY,
        executor,
        localReducer,
        remoteReducer,
        initLocal,
        initRemote,
        flushToServer,
      );
    }, [props.KEY]);

    useEffect(() => {
      const cleanup = subscribeToServer(props.KEY, store.getOffset(), store.onServerEvent);

      return cleanup;
    }, [store, props.KEY]);

    return <StoreContext.Provider value={store}>{props.children}</StoreContext.Provider>;
  }

  // build hooks
  function useExecute() {
    const store = useContext(StoreContext);
    return store!.execute;
  }

  function useSelector<T>(selector: (state: { local: LocalState; remote: RemoteState }) => T): T {
    const store = useContext(StoreContext);
    const mutableValue = useRef<T>();
    const [value, setValue] = useState<T>(() => {
      const snapshot = store!.getSnapshot();
      const v = selector(snapshot);
      mutableValue.current = v;
      return v;
    });

    useEffect(() => {
      const unsubscribe = store!.subscribe(({ local, remote }) => {
        // *only* update state if value has changed
        const nextValue = selector({ local, remote });
        if (mutableValue !== nextValue) {
          mutableValue.current = nextValue;
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
