import React from 'react';
import type { Puzzle } from '@ajhyndman/puz';

import styles from './Test.module.css';
import Clue from '../../../app/components/Clue';
import BottomAppBar from '../../../app/components/BottomAppBar';
import IconButton from '../../../app/components/IconButton';
import FloatingActionButton from '../../../app/components/FloatingActionButton';
import PuzzleGrid from '../../../app/components/PuzzleGrid';

type Props = {
  puzzle: Puzzle;
};

export default ({ puzzle }: Props) => (
  <>
    <div className={styles.container}>
      <PuzzleGrid puzzle={puzzle} />
    </div>
    {/* <ol>
      {puzzle.clues.map((clue, i) => (
        <Clue isActive={i + 1 === 86} index={i + 1} content={clue} />
      ))}
    </ol> */}
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
  </>
);
