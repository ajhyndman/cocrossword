import { Executor, SubscribeToServer, createStore } from '~/store/redux-isomorphic';
import {
  SelectionAction as LocalEvent,
  Selection as LocalState,
  reducer as localReducer,
  DEFAULT_SELECTION as LOCAL_DEFAULT_STATE,
} from '~/store/local/selection';
import {
  Action as RemoteEvent,
  State as RemoteState,
  reducer as remoteReducer,
  DEFAULT_STATE as REMOTE_DEFAULT_STATE,
} from '~/store/remote/index';

type Command = LocalEvent | RemoteEvent;

const executor: Executor<
  LocalState,
  RemoteState,
  Command,
  LocalEvent,
  RemoteEvent & { id: string }
> = (state, command, dispatchLocal, dispatchRemote) => {
  // TODO: differentiate commands and events
  switch (command.type) {
    case 'SELECT':
    case 'ROTATE_SELECTION':
    case 'ADVANCE_CURSOR':
    case 'RETREAT_CURSOR':
    case 'KEYBOARD_NAVIGATE':
    case 'PREVIOUS_CLUE':
    case 'NEXT_CLUE':
    case 'TOGGLE_PENCIL':
      return dispatchLocal(command);
    default:
      return dispatchRemote(command);
  }
};

const flushToServer = (events: [string, RemoteEvent]) =>
  fetch('/dispatch', {
    method: 'POST',
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(events),
  });

const subscribeToServer: SubscribeToServer<RemoteEvent> = (key, subscriber) => {
  // TODO
  const eventSource = new EventSource(`/kafka/sse?key=${key}`);
  const handleEvent = (event: MessageEvent<string>) => {
    // parse batch
    const actions = JSON.parse(event.data);
    actions.forEach((a: string) => {
      const action = JSON.parse(a);
      subscriber(action);
    });
  };

  eventSource.addEventListener(key, handleEvent);

  return () => {
    eventSource.removeEventListener(key, handleEvent);
    eventSource.close();
  };
};

export const { Provider, useExecute, useSelector } = createStore<
  Command,
  LocalEvent,
  // @ts-expect-error TODO: refactor so that commands and events are not reused
  RemoteEvent,
  LocalState,
  RemoteState
>(
  executor,
  localReducer,
  remoteReducer,
  LOCAL_DEFAULT_STATE,
  REMOTE_DEFAULT_STATE,
  flushToServer,
  subscribeToServer,
);
