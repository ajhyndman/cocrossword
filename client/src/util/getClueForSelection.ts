import { gridNumbering, Puzzle } from '@ajhyndman/puz';

export const getClueForSelection = (
  puzzle: Puzzle,
  selection: { index: number; direction: 'row' | 'column' },
): number => {
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
