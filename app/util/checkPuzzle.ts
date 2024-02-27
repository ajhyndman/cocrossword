import { Puzzle } from '@ajhyndman/puz';

export function checkPuzzle(puzzle: Puzzle): Puzzle {
  if (!puzzle.state) return puzzle;

  // copy markup grid and resize it if necessary
  const markupGrid = puzzle.markupGrid?.slice() ?? [];
  markupGrid.length = puzzle.state.length;

  puzzle.state.split('').forEach((char, i) => {
    // if cell has been populated, and does not match solution
    if (char !== '-' && puzzle?.solution?.[i] !== char) {
      // mark incorrect
      markupGrid[i] = { ...markupGrid[i], incorrect: true };
    }
  });

  return { ...puzzle, markupGrid };
}
