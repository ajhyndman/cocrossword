import type { Puzzle } from '@ajhyndman/puz';

import type { Selection } from '~/store/local/selection';
import { getClueForSelection } from './getClueForSelection';

export const getActiveClues = (
  puzzle: Pick<Puzzle, 'solution' | 'width'>,
  selection: Selection,
) => {
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
