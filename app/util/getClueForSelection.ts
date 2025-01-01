import { gridNumbering, Puzzle } from '@ajhyndman/puz';
import memoize from 'lodash.memoize';

import type { Selection } from '~/store/local/selection';

const getClueForSelectionMemo = memoize(function (
  solution: Puzzle['solution'],
  width: Puzzle['width'],
  direction: Selection['direction'],
  selectionIndex: Selection['index'],
): number {
  if (selectionIndex == null) return -1;

  const numbering = gridNumbering({ solution, width });
  let clue;

  let index = selectionIndex;

  // find the clue associated with this selection
  do {
    clue = numbering[index];
    index = index - (direction === 'row' ? 1 : width);
  } while (
    index >= 0 &&
    solution[index] !== '.' &&
    (direction !== 'row' || index % width !== width - 1)
  );
  return clue!;
});

export const getClueForSelection = (
  puzzle: Pick<Puzzle, 'solution' | 'width'>,
  selection: Selection,
): number => {
  return getClueForSelectionMemo(
    puzzle.solution,
    puzzle.width,
    selection.direction,
    selection.index,
  );
};
