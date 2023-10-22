import { getClueForSelection } from '../util/getClueForSelection';
import { State } from './types';

export const selectPuzzle = (state: State) => state.puzzle;

export const selectSelection = (state: State) => state.selection;

export const selectActiveClues = (state: State) => {
  const puzzle = selectPuzzle(state);
  const selection = selectSelection(state);
  if (puzzle == null || selection.index == null) return [];
  return [
    getClueForSelection(puzzle, {
      index: selection.index,
      direction: selection.direction,
    }), //primary
    getClueForSelection(puzzle, {
      index: selection.index,
      direction: selection.direction === 'row' ? 'column' : 'row',
    }), // secondary
  ];
};
