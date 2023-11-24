import { enumerateClues, gridNumbering } from '@ajhyndman/puz';

import { getClueForSelection } from '~/util/getClueForSelection';
import { getNextIndex, getPrevIndex } from '~/util/cursor';
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

type Command =
  | { type: 'ADVANCE_CURSOR'; payload?: undefined }
  | { type: 'RETREAT_CURSOR'; payload?: undefined }
  | {
      type: 'KEYBOARD_NAVIGATE';
      payload: { key: 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' };
    }
  | { type: 'PREVIOUS_CLUE'; payload?: undefined }
  | { type: 'NEXT_CLUE'; payload?: undefined };

type AllActions = Command | LocalEvent | RemoteEvent;

const executor: Executor<
  LocalState,
  RemoteState,
  AllActions,
  LocalEvent,
  RemoteEvent & { id: string }
> = ({ local, remote }, command, dispatchLocal, dispatchRemote) => {
  // TODO: differentiate commands and events
  switch (command.type) {
    case 'ADVANCE_CURSOR': {
      if (!remote.puzzle || local.index == null) break;
      const index = getNextIndex(remote.puzzle, local)!;
      dispatchLocal({ type: 'SELECT', payload: { index } });
      break;
    }

    case 'RETREAT_CURSOR': {
      if (!remote.puzzle || local.index == null) break;
      const index = getPrevIndex(remote.puzzle, local)!;
      dispatchLocal({ type: 'SELECT', payload: { index } });
      break;
    }

    case 'KEYBOARD_NAVIGATE': {
      if (!remote.puzzle || local.index == null) break;
      let nextIndex = local.index;
      do {
        switch (command.payload.key) {
          case 'ArrowDown':
            nextIndex += remote.puzzle.width;
            break;
          case 'ArrowLeft':
            nextIndex -= 1;
            break;
          case 'ArrowRight':
            nextIndex += 1;
            break;
          case 'ArrowUp':
            nextIndex -= remote.puzzle.width;
            break;
        }
        nextIndex = (nextIndex + remote.puzzle.solution.length) % remote.puzzle.solution.length;
      } while (remote.puzzle.solution[nextIndex] === '.');
      dispatchLocal({ type: 'SELECT', payload: { index: nextIndex } });
      break;
    }

    case 'NEXT_CLUE': {
      if (!remote.puzzle || local.index == null) break;
      const selectedClue = getClueForSelection(remote.puzzle, local);
      const numbering = gridNumbering(remote.puzzle);
      const clues = enumerateClues(remote.puzzle);
      const clueCategory = local.direction === 'row' ? 'across' : 'down';
      const numClues = clues[clueCategory].length;

      const clueIndex = clues[clueCategory].findIndex(({ number }) => number === selectedClue);
      const nextClue = clues[clueCategory][(clueIndex + 1) % numClues].number;
      const nextIndex = numbering.findIndex((number) => number === nextClue);
      dispatchLocal({ type: 'SELECT', payload: { index: nextIndex } });
      break;
    }

    case 'PREVIOUS_CLUE': {
      if (!remote.puzzle || local.index == null) break;
      const selectedClue = getClueForSelection(remote.puzzle, local);
      const numbering = gridNumbering(remote.puzzle);
      const clues = enumerateClues(remote.puzzle);
      const clueCategory = local.direction === 'row' ? 'across' : 'down';
      const numClues = clues[clueCategory].length;

      const clueIndex = clues[clueCategory].findIndex(({ number }) => number === selectedClue);
      const nextClue = clues[clueCategory][(clueIndex + numClues - 1) % numClues].number;
      const nextIndex = numbering.findIndex((number) => number === nextClue);
      dispatchLocal({ type: 'SELECT', payload: { index: nextIndex } });
      break;
    }

    case 'SELECT':
    case 'ROTATE_SELECTION':
    case 'TOGGLE_PENCIL':
      dispatchLocal(command);
      break;

    default:
      dispatchRemote(command);
      break;
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
