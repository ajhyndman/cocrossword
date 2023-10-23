import type { Puzzle } from '@ajhyndman/puz';

import { createStore } from '~/util/redux-lite';

export type State = {
  puzzle?: Puzzle;
};

export type Action =
  | {
      type: 'NEW_PUZZLE';
      payload: Puzzle;
    }
  | {
      type: 'CELL_CHANGED';
      payload: { index: number; value: string };
    };

const DEFAULT_STATE = {};

const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case 'NEW_PUZZLE':
      return { ...state, puzzle: payload };
    case 'CELL_CHANGED':
      if (!state.puzzle?.state) return state;
      const nextState = [...state.puzzle.state];
      nextState[payload.index] = payload.value.slice(0, 1).toUpperCase();
      return { ...state, puzzle: { ...state.puzzle, state: nextState.join('') } };
    default:
      return state;
  }
};

const { Provider, useContext } = createStore(reducer, DEFAULT_STATE);

export const PuzzleProvider = Provider;

export const usePuzzleContext = () => {
  const { dispatch, state } = useContext();
  return { dispatch, puzzle: state.puzzle };
};
