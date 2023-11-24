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
  | { type: 'FOCUS'; payload: { index: number; userId: string } }
  | { type: 'ADVANCE_CURSOR'; payload: { userId: string } }
  | { type: 'RETREAT_CURSOR'; payload: { userId: string } }
  | {
      type: 'KEYBOARD_NAVIGATE';
      payload: { userId: string; key: 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' };
    }
  | { type: 'PREVIOUS_CLUE'; payload: { userId: string } }
  | { type: 'NEXT_CLUE'; payload: { userId: string } };

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
      const id = command.payload.userId;
      const index = getNextIndex(remote.puzzle, local)!;
      dispatchLocal({ type: 'SELECT', payload: { index } });
      dispatchRemote({ type: 'USER_SELECTION_CHANGED', payload: { index, id } });
      break;
    }

    case 'RETREAT_CURSOR': {
      if (!remote.puzzle || local.index == null) break;
      const id = command.payload.userId;
      const index = getPrevIndex(remote.puzzle, local)!;
      dispatchLocal({ type: 'SELECT', payload: { index } });
      dispatchRemote({ type: 'USER_SELECTION_CHANGED', payload: { index, id } });
      break;
    }

    case 'KEYBOARD_NAVIGATE': {
      if (!remote.puzzle || local.index == null) break;
      const id = command.payload.userId;
      let index = local.index;
      do {
        switch (command.payload.key) {
          case 'ArrowDown':
            index += remote.puzzle.width;
            break;
          case 'ArrowLeft':
            index -= 1;
            break;
          case 'ArrowRight':
            index += 1;
            break;
          case 'ArrowUp':
            index -= remote.puzzle.width;
            break;
        }
        index = (index + remote.puzzle.solution.length) % remote.puzzle.solution.length;
      } while (remote.puzzle.solution[index] === '.');
      dispatchLocal({ type: 'SELECT', payload: { index } });
      dispatchRemote({ type: 'USER_SELECTION_CHANGED', payload: { index, id } });
      break;
    }

    case 'NEXT_CLUE': {
      if (!remote.puzzle || local.index == null) break;
      const id = command.payload.userId;
      const selectedClue = getClueForSelection(remote.puzzle, local);
      const numbering = gridNumbering(remote.puzzle);
      const clues = enumerateClues(remote.puzzle);
      const clueCategory = local.direction === 'row' ? 'across' : 'down';
      const numClues = clues[clueCategory].length;

      const clueIndex = clues[clueCategory].findIndex(({ number }) => number === selectedClue);
      const nextClue = clues[clueCategory][(clueIndex + 1) % numClues].number;
      const index = numbering.findIndex((number) => number === nextClue);
      dispatchLocal({ type: 'SELECT', payload: { index } });
      dispatchRemote({ type: 'USER_SELECTION_CHANGED', payload: { index, id } });
      break;
    }

    case 'PREVIOUS_CLUE': {
      if (!remote.puzzle || local.index == null) break;
      const id = command.payload.userId;
      const selectedClue = getClueForSelection(remote.puzzle, local);
      const numbering = gridNumbering(remote.puzzle);
      const clues = enumerateClues(remote.puzzle);
      const clueCategory = local.direction === 'row' ? 'across' : 'down';
      const numClues = clues[clueCategory].length;

      const clueIndex = clues[clueCategory].findIndex(({ number }) => number === selectedClue);
      const nextClue = clues[clueCategory][(clueIndex + numClues - 1) % numClues].number;
      const index = numbering.findIndex((number) => number === nextClue);
      dispatchLocal({ type: 'SELECT', payload: { index } });
      dispatchRemote({ type: 'USER_SELECTION_CHANGED', payload: { index, id } });
      break;
    }

    case 'FOCUS': {
      const index = command.payload.index;
      const id = command.payload.userId;
      dispatchLocal({ type: 'SELECT', payload: { index } });
      dispatchRemote({ type: 'USER_SELECTION_CHANGED', payload: { index, id } });
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
