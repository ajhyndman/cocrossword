import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { gridNumbering } from '@ajhyndman/puz';

import styles from './PuzzleGrid.module.css';
import PuzzleCell from './PuzzleCell';
import { selectPuzzle } from '../store/selectors';

export default () => {
  const puzzle = useSelector(selectPuzzle);
  const dispatch = useDispatch();
  if (!puzzle) return null;
  const numbering = gridNumbering(puzzle);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        dispatch({ type: 'KEYBOARD_NAVIGATE', payload: { key: event.key } });
        break;
      case ' ':
        event.preventDefault();
        dispatch({ type: 'ROTATE_SELECTION' });
      default:
      // pass
    }
  };

  return (
    <div
      className={styles.grid}
      style={{
        gridTemplateColumns: `repeat(${puzzle.width}, 33px)`,
      }}
      onKeyDown={handleKeyDown}
    >
      {[...puzzle.state!].map((char, i) => (
        <PuzzleCell index={i} number={numbering[i]} content={char} />
      ))}
    </div>
  );
};
