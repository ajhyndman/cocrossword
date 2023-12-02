import { SubscribeToServer, createStore } from '~/store/redux-isomorphic';
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
import { type Command, executor } from './executor';

type AllActions = Command | LocalEvent | RemoteEvent;

const flushToServer = (events: [string, RemoteEvent]) =>
  fetch('/dispatch', {
    method: 'POST',
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(events),
  });

const subscribeToServer: SubscribeToServer<RemoteEvent> = (key, offset, subscriber) => {
  const eventSource = new EventSource(`/kafka/sse?key=${key}&offset=${offset}`);
  const handleEvent = (event: MessageEvent<string>) => {
    // parse batch
    const actions = JSON.parse(event.data);
    actions.forEach((action: RemoteEvent) => {
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
  AllActions,
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
