import { enumerateClues, gridNumbering, printBinaryFile } from '@ajhyndman/puz';

import { getClueForSelection } from '~/util/getClueForSelection';
import { getNextIndex, getPrevIndex } from '~/util/cursor';
import { Executor } from '~/store/redux-isomorphic';
import { SelectionAction as LocalEvent, Selection as LocalState } from '~/store/local/selection';
import { Action as RemoteEvent, State as RemoteState } from '~/store/remote/index';

export type Command =
  | { type: 'DELETE'; payload: { index: number; userId: string; backspace?: boolean } }
  | { type: 'INPUT'; payload: { index: number; value: string; userId: string } }
  | { type: 'DOWNLOAD_PUZZLE'; payload?: undefined }
  | { type: 'FOCUS'; payload: { index: number; userId: string } }
  | { type: 'ADVANCE_CURSOR'; payload: { userId: string } }
  | { type: 'RETREAT_CURSOR'; payload: { userId: string } }
  | {
      type: 'KEYBOARD_NAVIGATE';
      payload: { userId: string; key: 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' };
    }
  | { type: 'PREVIOUS_CLUE'; payload: { userId: string } }
  | { type: 'NEXT_CLUE'; payload: { userId: string } }
  | { type: 'SELECT_CLUE'; payload: { direction: 'ACROSS' | 'DOWN'; number: number } }
  | LocalEvent
  | RemoteEvent;

export const executor: Executor<
  LocalState,
  RemoteState,
  Command,
  LocalEvent,
  RemoteEvent & { id: string; offset: number }
> = ({ local, remote }, command, dispatchLocal, dispatchRemote, execute) => {
  // TODO: differentiate commands and events
  switch (command.type) {
    case 'DELETE': {
      if (!remote.puzzle || remote.isCorrect) break;
      let deletedIndex = command.payload.index;
      const content = remote.puzzle.state?.[deletedIndex];
      const isBlackCell = content === '.';
      const cellContent = !isBlackCell && content !== '-' && content;
      if (command.payload.backspace && cellContent === false) {
        deletedIndex = getPrevIndex(remote.puzzle, local)!;
        execute({ type: 'RETREAT_CURSOR', payload: { userId: command.payload.userId } });
      }
      dispatchRemote({ type: 'CELL_CHANGED', payload: { index: deletedIndex, value: '-', userId: command.payload.userId } });
      break;
    }

    case 'INPUT': {
      const { index, value, userId } = command.payload;

      if (value === '.') {
        dispatchLocal({ type: 'TOGGLE_PENCIL' });
        break;
      }

      if (value === ' ') {
        dispatchLocal({ type: 'ROTATE_SELECTION' });
        break;
      }

      if (!remote.puzzle || remote.isCorrect) break;

      dispatchRemote({
        type: 'CELL_CHANGED',
        payload: { index, value, isPencil: local.isPencil, userId },
      });
      execute({ type: 'ADVANCE_CURSOR', payload: { userId } });
      break;
    }

    case 'DOWNLOAD_PUZZLE': {
      // export the current puzzle state as a .puz binary file
      if (remote.puzzle) {
        const buffer = printBinaryFile(remote.puzzle);
        const file = new File([buffer], 'download.puz');
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.download = file.name;
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      }
      break;
    }

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

    case 'SELECT_CLUE': {
      if (!remote.puzzle) break;
      const { direction, number } = command.payload;
      const numbering = gridNumbering(remote.puzzle);
      const index = numbering.indexOf(number);
      if (index === -1) break;
      dispatchLocal({ type: 'SELECT', payload: { index } });
      if (
        (local.direction === 'column' && direction === 'ACROSS') ||
        (local.direction === 'row' && direction === 'DOWN')
      ) {
        dispatchLocal({ type: 'ROTATE_SELECTION' });
      }
      break;
    }

    case 'FOCUS': {
      const index = command.payload.index;
      const id = command.payload.userId;
      dispatchLocal({ type: 'SELECT', payload: { index } });
      dispatchRemote({ type: 'USER_SELECTION_CHANGED', payload: { index, id } });
      break;
    }

    case 'ROTATE_SELECTION':
    case 'SELECT':
    case 'TOGGLE_PENCIL':
      dispatchLocal(command);
      break;

    default:
      dispatchRemote(command);
  }
};
