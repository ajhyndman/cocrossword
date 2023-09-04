import React from 'react';
import { Puzzle, gridNumbering } from '@ajhyndman/puz';

import styles from './PuzzleGrid.module.css';
import PuzzleCell from './PuzzleCell';

type Props = {
  puzzle: Puzzle;
};

export default ({ puzzle }: Props) => {
  const numbering = gridNumbering(puzzle);
  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${puzzle.width}, 32px)`,
      }}
    >
      {[...puzzle.solution].map((char, i) => (
        <PuzzleCell number={numbering[i]} content={char} />
      ))}
    </div>
  );
};
