import { gridNumbering, Puzzle } from '@ajhyndman/puz';

import { Selection } from '~/store/local/selection';

export const getClueForSelection = (
  puzzle: Pick<Puzzle, 'solution' | 'width'>,
  selection: Selection,
): number => {
  if (selection.index == null) return -1;

  const numbering = gridNumbering(puzzle);
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
