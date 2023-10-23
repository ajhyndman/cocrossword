import type { Puzzle } from '@ajhyndman/puz';

import { createStore } from '~/util/redux-lite';

export type State = {
  puzzle?: Puzzle;
};

export type Action = {
  type: 'NEW_PUZZLE';
  payload: Puzzle;
};

const DEFAULT_STATE = {};

const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case 'NEW_PUZZLE':
      return { ...state, puzzle: payload };
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
