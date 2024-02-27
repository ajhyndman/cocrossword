import { type Puzzle, isCorrect } from '@ajhyndman/puz';

import { checkPuzzle } from '~/util/checkPuzzle';

export type State = {
  puzzle?: Puzzle;
  autocheck?: boolean;
  isCorrect?: boolean;
};

export type Action =
  | {
      type: 'NEW_PUZZLE';
      payload: Puzzle;
    }
  | {
      type: 'CELL_CHANGED';
      payload: { index: number; value: string; isPencil?: boolean };
    }
  | {
      type: 'CHECK_PUZZLE';
      payload?: undefined;
    }
  | {
      type: 'TOGGLE_STARRED';
      payload: { index: number };
    }
  | {
      type: 'TOGGLE_AUTOCHECK';
      payload?: undefined;
    };

const VALID_INPUT_REGEX = /^[-A-Za-z0-9@#$%&+?]+$/;

export const DEFAULT_STATE = {};

export const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case 'NEW_PUZZLE':
      return { ...state, puzzle: payload, isCorrect: isCorrect(payload) };

    case 'CELL_CHANGED': {
      if (
        // if puzzle is already correct
        state.isCorrect ||
        // if no puzzle set yet
        !state.puzzle?.state ||
        // if action has no contents
        payload.value == null ||
        // , or character is invalid
        !VALID_INPUT_REGEX.test(payload.value)
      ) {
        // ignore this action
        return state;
      }
      // update the character at the given position
      const nextState = [...state.puzzle.state];
      nextState[payload.index] = payload.value.slice(0, 1).toUpperCase();

      // also set markup flag
      const markupGrid = state.puzzle.markupGrid?.slice() ?? [];
      markupGrid.length = state.puzzle.state.length;
      markupGrid[payload.index] = {
        ...markupGrid[payload.index],
        penciled: payload.isPencil,
      };
      // clear any previous checked state
      delete markupGrid[payload.index].incorrect;
      delete markupGrid[payload.index].revealed;

      let puzzle: Puzzle = { ...state.puzzle, state: nextState.join(''), markupGrid };

      if (state.autocheck) {
        puzzle = checkPuzzle(puzzle);
      }

      return { ...state, puzzle, isCorrect: isCorrect(puzzle, true) };
    }

    // NOTE: This only sets a markup flag (for now)
    case 'TOGGLE_STARRED': {
      if (
        // if puzzle is already correct
        state.isCorrect ||
        // if no puzzle set yet
        !state.puzzle?.state ||
        // no cell currently selected
        payload?.index == null
      ) {
        // ignore this action
        return state;
      }
      // set markup flag
      const markupGrid = state.puzzle.markupGrid?.slice() ?? [];
      markupGrid.length = state.puzzle.state.length;
      // set bit flag 04,which we will use as starred
      markupGrid[payload.index] = {
        ...markupGrid[payload.index],
        unknown_04: !markupGrid[payload.index]?.unknown_04,
      };

      return { ...state, puzzle: { ...state.puzzle, markupGrid } };
    }

    case 'TOGGLE_AUTOCHECK': {
      return { ...state, autocheck: !state.autocheck };
    }

    case 'CHECK_PUZZLE': {
      if (
        // if puzzle is already correct
        state.isCorrect ||
        // if no puzzle set yet
        !state.puzzle?.state
      ) {
        // ignore this action
        return state;
      }

      return { ...state, puzzle: checkPuzzle(state.puzzle) };
    }

    default:
      return state;
  }
};
