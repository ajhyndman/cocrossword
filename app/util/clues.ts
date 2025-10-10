import { Puzzle, enumerateClues, gridNumbering } from '@ajhyndman/puz';

import { getClueForSelection } from '~/util/getClueForSelection';
import { Selection as LocalState } from '~/store/local/selection';

export const emptyCellsForClue = (
  puzzle: Puzzle,
  clueIndex: number,
  clueCategory: 'across' | 'down',
): number[] => {
  if (!puzzle.state) {
    return [];
  }

  let delta: number;
  let endIndex: number;
  if (clueCategory === 'down') {
    delta = puzzle.width;
    endIndex = puzzle.state.length;
  } else {
    delta = 1;
    endIndex = clueIndex + puzzle.width - (clueIndex % puzzle.width);
  }

  const emptyCells: number[] = [];
  for (let i = clueIndex; i < endIndex && puzzle.state; i += delta) {
    if (puzzle.state[i] === '-') {
      emptyCells.push(i);
    } else if (puzzle.state[i] === '.') {
      return emptyCells;
    }
  }

  return emptyCells;
};

export const findClueIndex = (
  puzzle: Puzzle,
  selection: LocalState,
  direction: 'next' | 'previous',
): number => {
  const selectedClue = getClueForSelection(puzzle, selection);
  const numbering = gridNumbering(puzzle);
  const clues = enumerateClues(puzzle);
  const clueCategory = selection.direction === 'row' ? 'across' : 'down';
  const numClues = clues[clueCategory].length;
  const clueIndex = clues[clueCategory].findIndex(({ number }) => number === selectedClue);

  // Try to find a clue with an empty square
  let i = 1;
  const searchDirection = direction === 'next' ? 1 : -1;
  let index: number | null = null;
  while (i < numClues && index == null) {
    const nextClue =
      clues[clueCategory][(clueIndex + numClues + searchDirection * i) % numClues].number;
    const nextClueIndex = numbering.findIndex((number) => number === nextClue);
    const emptyCells = emptyCellsForClue(puzzle, nextClueIndex, clueCategory);
    if (emptyCells.length > 0) {
      index = emptyCells[0];
    }

    i++;
  }

  // If all clues are filled in, go to the start of the previous one
  if (index == null) {
    const nextClue =
      clues[clueCategory][(clueIndex + numClues + searchDirection) % numClues].number;
    index = numbering.findIndex((number) => number === nextClue);
  }

  return index;
};

export const isEndOfClue = (puzzle: Puzzle, selection: LocalState) => {
  if (!puzzle.state || selection.index == null) {
    return false;
  }

  if (selection.direction === 'row') {
    const nextIndex = selection.index + 1;
    return nextIndex % puzzle.width === 0 || puzzle.state[nextIndex] === '.';
  } else {
    const nextIndex = selection.index + puzzle.width;
    return nextIndex >= puzzle.state.length || puzzle.state[nextIndex] === '.';
  }
};
