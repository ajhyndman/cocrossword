import type { Puzzle } from '@ajhyndman/puz';

import type { Selection } from '~/store/local/selection';

export function getNextIndex(puzzle: Puzzle, selection: Selection) {
  if (selection.index == null || puzzle.state == null) return selection.index;

  let nextIndex = selection.index;
  let fallback = selection.index;
  // try to find next empty cell
  do {
    if (selection.direction === 'row') {
      nextIndex += 1;
    } else {
      nextIndex += puzzle.width;
    }
    if (
      // off the bottom of the puzzle
      nextIndex > puzzle.solution.length ||
      // next cell is a black square
      puzzle.solution[nextIndex] === '.' ||
      // off the right edge of the puzzle
      (selection.direction === 'row' && nextIndex % puzzle.width === 0)
    ) {
      return fallback;
    } else if (fallback === selection.index) {
      // advance fallback one time
      fallback = nextIndex;
    }
  } while (
    // keep advancing if cell is not empty
    puzzle.state?.[nextIndex] !== '-'
  );
  return nextIndex;
}

export function getPrevIndex(puzzle: Pick<Puzzle, 'solution' | 'width'>, selection: Selection) {
  if (selection.index == null) return selection.index;
  let nextIndex = selection.index;
  if (selection.direction === 'row') {
    nextIndex -= 1;
  } else {
    nextIndex -= puzzle.width;
  }
  if (
    // off the top of the puzzle
    nextIndex < 0 ||
    // next cell is a black square
    puzzle.solution[nextIndex] === '.' ||
    // off the left edge of the puzzle
    (selection.direction === 'row' && nextIndex % puzzle.width === puzzle.width - 1)
  ) {
    return selection.index;
  }
  return nextIndex;
}
