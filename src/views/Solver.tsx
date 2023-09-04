import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enumerateClues } from '@ajhyndman/puz';

import styles from './Solver.module.css';
import BottomAppBar from '../components/BottomAppBar';
import IconButton from '../components/IconButton';
import FloatingActionButton from '../components/FloatingActionButton';
import Clue from '../components/Clue';
import PuzzleGrid from '../components/PuzzleGrid';
import {
  selectPuzzle,
  selectActiveClues,
  selectSelection,
} from '../store/selectors';

export default () => {
  const puzzle = useSelector(selectPuzzle);
  const selection = useSelector(selectSelection);
  const dispatch = useDispatch();

  if (!puzzle) return null;

  const handleRotateSelectionClick = () => {
    // if element is already selected, "focus" event won't be triggered
    dispatch({ type: 'TOGGLE_SELECTION_DIRECTION' });
  };

  const [primaryClue] = useSelector(selectActiveClues);
  const clues = enumerateClues(puzzle);
  const clue = clues[selection.direction === 'row' ? 'across' : 'down'].find(
    (clue) => clue.number === primaryClue,
  );

  return (
    <div className={styles.container}>
      <div className={styles.puzzle}>
        <PuzzleGrid />
      </div>
      <div className={styles.sticky}>
        {clue && <Clue isActive index={clue.number} content={clue.clue} />}
        <BottomAppBar
          left={
            <>
              <IconButton name="chat" />
              <IconButton name="info" />
              <IconButton name="check_box" />
              <IconButton name="edit" />
            </>
          }
          right={
            <FloatingActionButton
              name="text_rotation_none"
              onClick={handleRotateSelectionClick}
            />
          }
        />
      </div>
      {/* simply having a position: fixed element on the page fixes a bug with
      position: sticky on some browsers.
      @see: https://www.stevefenton.co.uk/blog/2022/12/mobile-position-sticky-issue/ */}
      <div className={styles.fixed} />
    </div>
  );
};
