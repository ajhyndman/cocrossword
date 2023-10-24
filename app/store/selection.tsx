import { enumerateClues, gridNumbering, type Puzzle } from '@ajhyndman/puz';
import type { ReactNode } from 'react';

import { createStore } from '~/util/redux-lite';
import { getClueForSelection } from '~/util/getClueForSelection';
import { getNextIndex, getPrevIndex } from '~/util/cursor';

export type Selection = {
  readonly index?: number;
  readonly direction: 'column' | 'row';
};

export type SelectionAction =
  | { type: 'SELECT'; payload: { index: number } }
  | { type: 'ROTATE_SELECTION'; payload?: undefined }
  | { type: 'ADVANCE_CURSOR'; payload?: undefined }
  | { type: 'RETREAT_CURSOR'; payload?: undefined }
  | {
      type: 'KEYBOARD_NAVIGATE';
      payload: { key: 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' };
    }
  | { type: 'PREVIOUS_CLUE'; payload?: undefined }
  | { type: 'NEXT_CLUE'; payload?: undefined };

const DEFAULT_SELECTION: Selection = { direction: 'row' };

const reducer =
  (puzzle: Puzzle) =>
  (state: Selection, { type, payload }: SelectionAction) => {
    switch (type) {
      case 'SELECT': {
        return { ...state, index: payload.index };
      }

      case 'ROTATE_SELECTION': {
        return {
          ...state,
          direction: state.direction === 'row' ? ('column' as const) : ('row' as const),
        };
      }

      case 'ADVANCE_CURSOR': {
        return { ...state, index: getNextIndex(puzzle, state) };
      }

      case 'RETREAT_CURSOR': {
        return { ...state, index: getPrevIndex(puzzle, state) };
      }

      case 'KEYBOARD_NAVIGATE': {
        if (state.index == null) return state;
        let nextIndex = state.index;
        do {
          switch (payload.key) {
            case 'ArrowDown':
              nextIndex += puzzle.width;
              break;
            case 'ArrowLeft':
              nextIndex -= 1;
              break;
            case 'ArrowRight':
              nextIndex += 1;
              break;
            case 'ArrowUp':
              nextIndex -= puzzle.width;
              break;
          }
          nextIndex = (nextIndex + puzzle.solution.length) % puzzle.solution.length;
        } while (puzzle.solution[nextIndex] === '.');
        return { ...state, index: nextIndex };
      }

      case 'NEXT_CLUE': {
        if (state.index == null) return state;
        // @ts-ignore TS thinks the state reference is mutable
        const selectedClue = getClueForSelection(puzzle, state);
        const numbering = gridNumbering(puzzle);
        const clues = enumerateClues(puzzle);
        const clueCategory = state.direction === 'row' ? 'across' : 'down';
        const numClues = clues[clueCategory].length;

        const clueIndex = clues[clueCategory].findIndex(({ number }) => number === selectedClue);
        const nextClue = clues[clueCategory][(clueIndex + 1) % numClues].number;
        const nextIndex = numbering.findIndex((number) => number === nextClue);
        return { ...state, index: nextIndex };
      }

      case 'PREVIOUS_CLUE': {
        if (state.index == null) return state;
        // @ts-ignore TS thinks the state reference is mutable
        const selectedClue = getClueForSelection(puzzle, state);
        const numbering = gridNumbering(puzzle);
        const clues = enumerateClues(puzzle);
        const clueCategory = state.direction === 'row' ? 'across' : 'down';
        const numClues = clues[clueCategory].length;

        const clueIndex = clues[clueCategory].findIndex(({ number }) => number === selectedClue);
        const nextClue = clues[clueCategory][(clueIndex + numClues - 1) % numClues].number;
        const nextIndex = numbering.findIndex((number) => number === nextClue);
        return { ...state, index: nextIndex };
      }

      default:
        return state;
    }
  };

const { Provider, useContext } = createStore<Selection, SelectionAction>(
  (a) => a,
  DEFAULT_SELECTION,
);

export const SelectionProvider = ({
  puzzle,
  children,
}: {
  puzzle: Puzzle;
  children: ReactNode;
}) => <Provider reducer={reducer(puzzle)}>{children}</Provider>;

export const useSelectionContext = () => {
  const { dispatch, state } = useContext();
  return { dispatch, selection: state };
};
