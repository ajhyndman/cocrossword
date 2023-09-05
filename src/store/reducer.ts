// @ts-ignore
import { readFileSync } from 'fs';
// @ts-ignore
import { join } from 'path';
import { parseBinaryFile, unscramble } from '@ajhyndman/puz';

import { Action, State } from './types';
import { REGEX_INPUT } from '../util/constants';

// REVERT ME
// @ts-ignore
const file = readFileSync(join(__dirname, '../../test/nyt_locked.puz'));
let puzzle = parseBinaryFile(file);
puzzle = unscramble(puzzle, '7844');
console.log(puzzle);

const initialState: State = {
  puzzle,
  selection: { index: undefined, direction: 'row' },
};

export const reducer = (
  state: State = initialState,
  { type, payload }: Action,
): State => {
  switch (type) {
    case 'INPUT': {
      if (state.selection.index == null) return state;
      if (!REGEX_INPUT.test(payload.value)) return state;

      const nextState = [...(state.puzzle?.state ?? '')];
      nextState[state.selection.index] = payload.value || '-';
      return {
        ...state,
        puzzle: state.puzzle && {
          ...state.puzzle,
          state: nextState.join(''),
        },
      };
    }
    case 'RETREAT_CURSOR': {
      if (
        state.selection.index == null ||
        !state.puzzle ||
        !state.puzzle.state
      ) {
        return state;
      }
      let nextIndex = state.selection.index;
      if (state.selection.direction === 'row') {
        nextIndex -= 1;
      } else {
        nextIndex -= state.puzzle.width;
      }
      if (nextIndex < 0 || state.puzzle.state?.[nextIndex] === '.') {
        return state;
      }
      return {
        ...state,
        selection: {
          ...state.selection,
          index: nextIndex,
        },
      };
    }
    case 'ADVANCE_CURSOR': {
      if (
        state.selection.index == null ||
        !state.puzzle ||
        !state.puzzle.state
      ) {
        return state;
      }
      let nextIndex = state.selection.index;
      if (state.selection.direction === 'row') {
        nextIndex += 1;
      } else {
        nextIndex += state.puzzle.width;
      }
      if (
        nextIndex > state.puzzle.state.length ||
        state.puzzle.state?.[nextIndex] === '.'
      ) {
        return state;
      }
      return {
        ...state,
        selection: {
          ...state.selection,
          index: nextIndex,
        },
      };
    }
    case 'KEYBOARD_NAVIGATE': {
      if (state.selection.index == null || !state.puzzle) return state;
      let nextIndex = state.selection.index;
      do {
        switch (payload.key) {
          case 'ArrowDown':
            nextIndex += state.puzzle.width;
            break;
          case 'ArrowLeft':
            nextIndex -= 1;
            break;
          case 'ArrowRight':
            nextIndex += 1;
            break;
          case 'ArrowUp':
            nextIndex -= state.puzzle.width;
            break;
        }
        nextIndex =
          (nextIndex + puzzle.solution.length) % puzzle.solution.length;
      } while (puzzle.solution[nextIndex] === '.');
      return {
        ...state,
        selection: {
          ...state.selection,
          index: nextIndex,
        },
      };
    }
    case 'SELECT': {
      return {
        ...state,
        selection: {
          ...state.selection,
          index: payload.index,
        },
      };
    }
    case 'ROTATE_SELECTION': {
      return {
        ...state,
        selection: {
          ...state.selection,
          direction: state.selection.direction === 'row' ? 'column' : 'row',
        },
      };
    }
    default:
      return state;
  }
};
