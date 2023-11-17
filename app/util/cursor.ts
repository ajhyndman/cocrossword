import type { Puzzle } from '@ajhyndman/puz';

import type { Selection } from '~/store/local/selection';

export function getNextIndex(puzzle: Puzzle, selection: Selection) {
  if (selection.index == null) return selection.index;
  let nextIndex = selection.index;
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
    return selection.index;
  }
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
  if (nextIndex < 0 || puzzle.solution[nextIndex] === '.') {
    return selection.index;
  }
  return nextIndex;
}
