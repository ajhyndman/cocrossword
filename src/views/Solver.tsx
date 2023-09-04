import React from 'react';

import styles from './Solver.module.css';
import BottomAppBar from '../components/BottomAppBar';
import IconButton from '../components/IconButton';
import FloatingActionButton from '../components/FloatingActionButton';
import Clue from '../components/Clue';
import PuzzleGrid from '../components/PuzzleGrid';

export default ({ puzzle }) => (
  <div className={styles.container}>
    <div className={styles.puzzle}>
      <PuzzleGrid puzzle={puzzle} />
    </div>
    <div className={styles.sticky}>
      <Clue isActive index={1} content={puzzle.clues[0]} />
      <BottomAppBar
        left={
          <>
            <IconButton name="chat" />
            <IconButton name="info" />
            <IconButton name="check_box" />
            <IconButton name="edit" />
          </>
        }
        right={<FloatingActionButton name="text_rotation_none" />}
      />
    </div>
    {/* simply having a position: fixed element on the page fixes a bug with
      position: sticky on some browsers.
      @see: https://www.stevefenton.co.uk/blog/2022/12/mobile-position-sticky-issue/ */}
    <div className={styles.fixed} />
  </div>
);
