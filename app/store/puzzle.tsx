import type { Puzzle } from '@ajhyndman/puz';

import { createStore } from '~/store/redux-kafka';

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
      // if no puzzle set yet, ignore this action
      if (!state.puzzle?.state) return state;
      // if action has no contents, ignore this action
      if (payload.value == null) return state;
      // update the character at the given position
      const nextState = [...state.puzzle.state];
      nextState[payload.index] = payload.value.slice(0, 1).toUpperCase();
      return { ...state, puzzle: { ...state.puzzle, state: nextState.join('') } };

    default:
      return state;
  }
};

const { Provider, useStore } = createStore('/kafka/sse', reducer, DEFAULT_STATE);

export const PuzzleProvider = Provider;

export const usePuzzleStore = () => {
  const { dispatch, state } = useStore();
  return { dispatch, puzzle: state.puzzle };
};
