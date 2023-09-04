import { gridNumbering, Puzzle } from '@ajhyndman/puz';

export const getClueForSelection = (
  puzzle: Puzzle,
  selection: { index: number; direction: 'row' | 'column' },
): number => {
  const numbering = gridNumbering(puzzle);
  const clue = numbering[selection.index];
  if (clue != null) return clue;
  let index = selection.index;
  if (selection.direction === 'row') {
    while (index >= 0) {
      // step left in the puzzle until we find a clue
      index = index - 1;
      const clue = numbering[index];
      if (clue != null) return clue;
    }
  }
  while (index >= 0) {
    // step up in the puzzle until we find a clue
    index = index - puzzle.width;
    const clue = numbering[index];
    if (clue != null) return clue;
  }
};
