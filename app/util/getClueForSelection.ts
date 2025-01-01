import { gridNumbering, Puzzle } from '@ajhyndman/puz';
import memoize from 'lodash.memoize';

import type { Selection } from '~/store/local/selection';

const gridNumberingMemo = memoize(function (solution, width) {
  return gridNumbering({ solution, width });
});

export const getClueForSelection = (
  puzzle: Pick<Puzzle, 'solution' | 'width'>,
  selection: Selection,
): number => {
  if (selection.index == null) return -1;

  const numbering = gridNumberingMemo(puzzle.solution, puzzle.width);
  let clue;
  let index = selection.index;

  // find the clue associated with this selection
  do {
    clue = numbering[index];
    index = index - (selection.direction === 'row' ? 1 : puzzle.width);
  } while (
    index >= 0 &&
    puzzle.solution[index] !== '.' &&
    (selection.direction !== 'row' || index % puzzle.width !== puzzle.width - 1)
  );
  return clue!;
};
