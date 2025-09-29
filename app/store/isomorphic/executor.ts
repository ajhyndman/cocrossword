import { Puzzle, enumerateClues, gridNumbering, printBinaryFile } from '@ajhyndman/puz';

import { getClueForSelection } from '~/util/getClueForSelection';
import { getNextIndex, getPrevIndex } from '~/util/cursor';
import { Executor } from '~/store/redux-isomorphic';
import { SelectionAction as LocalEvent, Selection as LocalState, } from '~/store/local/selection';
import { Action as RemoteEvent, State as RemoteState } from '~/store/remote/index';

const emptyCellsForClue = (puzzle: Puzzle, clueIndex: number, clueCategory: 'across' | 'down'): number[] => {
  if (!puzzle.state) {
    return [];
  }

  let delta: number;
  let endIndex: number;
  if (clueCategory === 'down') {
    delta = puzzle.width;
    endIndex = puzzle.state.length;
  } else {
    delta = 1;
    endIndex = clueIndex + puzzle.width - (clueIndex % puzzle.width);
  }

  const emptyCells: number[] = [];
  for (let i = clueIndex; i < endIndex && puzzle.state; i += delta) {
    if (puzzle.state[i] === '-') {
      emptyCells.push(i);
    } else if (puzzle.state[i] === '.') {
      return emptyCells;
    }
  }

  return emptyCells;
}

const findClueIndex = (puzzle:Puzzle, selection: LocalState, direction: 'next' | 'previous'): number => {
  const selectedClue = getClueForSelection(puzzle, selection);
  const numbering = gridNumbering(puzzle);
  const clues = enumerateClues(puzzle);
  const clueCategory = selection.direction === 'row' ? 'across' : 'down';
  const numClues = clues[clueCategory].length;
  const clueIndex = clues[clueCategory].findIndex(({ number }) => number === selectedClue);

  // Try to find a clue with an empty square
  let i = 1;
  const searchDirection = direction === 'next' ? 1 : -1;
  let index: number | null = null;
  while (i < numClues && index == null) {
    const nextClue = clues[clueCategory][(clueIndex + numClues + searchDirection * i) % numClues].number;
    const nextClueIndex = numbering.findIndex((number) => number === nextClue);
    const emptyCells = emptyCellsForClue(puzzle, nextClueIndex, clueCategory);
    if (emptyCells.length > 0) {
      index = emptyCells[0];
    }

    i++;
  }

  // If all clues are filled in, go to the start of the previous one
  if (index == null) {
    const nextClue = clues[clueCategory][(clueIndex + numClues + searchDirection) % numClues].number;
    index = numbering.findIndex((number) => number === nextClue);
  }

  return index;
}

const isEndOfClue = (puzzle: Puzzle, selection: LocalState) => {
  if (!puzzle.state || selection.index == null) {
    return false;
  }

  if (selection.direction === 'row') {
    const nextIndex = selection.index + 1;
    return nextIndex % puzzle.width === 0 || puzzle.state[nextIndex] === '.';
  } else {
    const nextIndex = selection.index + puzzle.width;
    return nextIndex >= puzzle.state.length || puzzle.state[nextIndex] === '.';
  }
}

export type Command =
  | { type: 'DELETE'; payload: { index: number; userId: string; backspace?: boolean } }
  | { type: 'INPUT'; payload: { index: number; value: string; userId: string } }
  | { type: 'DOWNLOAD_PUZZLE'; payload?: undefined }
  | { type: 'FOCUS'; payload: { index: number; userId: string } }
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
      dispatchRemote({ type: 'CELL_CHANGED', payload: { index: deletedIndex, value: '-' } });
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

      const puzzle = remote.puzzle;
      const currentClue = getClueForSelection(puzzle, local);
      const clueIndex = gridNumbering(puzzle).findIndex((number) => number === currentClue);
      const clueCategory = local.direction === 'row' ? 'across' : 'down';
      const emptyCells = emptyCellsForClue(puzzle, clueIndex, clueCategory)
      const typingInEmptyCell = remote.puzzle.state && remote.puzzle.state[index] === '-';

      let nextIndex: number;

      // If we are filling in the clue and there are empty empty cells (other than the one we are currently filling)
      // go to the next one
      if (typingInEmptyCell && emptyCells.length > 1) {
        nextIndex = emptyCells[0];
        for (let i = emptyCells.length - 1; i >= 0; i--) {
          if (emptyCells[i] > (local.index ?? 0)) {
            nextIndex = emptyCells[i];
          }
        }

      // If we fill in the last cell of the clue or we are
      // overwriting cell values and reach the last one, go
      // to the next clue
      } else if (
        (typingInEmptyCell && emptyCells.length <= 1) ||
        isEndOfClue(puzzle, local)
      ) {
        nextIndex = findClueIndex(puzzle, local, 'next')

      // Otherwise, we are typing over something and should go to the next cell
      } else {
        nextIndex = getNextIndex(puzzle, local)!
      }

      dispatchRemote({
        type: 'CELL_CHANGED',
        payload: { index, value, isPencil: local.isPencil },
      });
      dispatchLocal({ type: 'SELECT', payload: { index: nextIndex } });
      dispatchRemote({ type: 'USER_SELECTION_CHANGED', payload: { index: nextIndex, id: userId } });
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
      const index = findClueIndex(remote.puzzle, local, 'next')
      dispatchLocal({ type: 'SELECT', payload: { index } });
      dispatchRemote({ type: 'USER_SELECTION_CHANGED', payload: { index, id } });
      break;
    }

    case 'PREVIOUS_CLUE': {
      if (!remote.puzzle || local.index == null) break;
      const id = command.payload.userId;
      const index = findClueIndex(remote.puzzle, local, 'previous')
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
