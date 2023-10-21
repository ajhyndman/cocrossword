import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { enumerateClues } from '@ajhyndman/puz';

import styles from './puzzle.module.css';
import BottomAppBar from '~/components/BottomAppBar';
import IconButton from '~/components/IconButton';
import FloatingActionButton from '~/components/FloatingActionButton';
import ClueCarousel from '~/components/ClueCarousel';
import PuzzleGrid from '~/components/PuzzleGrid';
import {
  selectPuzzle,
  selectActiveClues,
  selectSelection,
} from '../store/selectors';

export default () => {
  const puzzle = useSelector(selectPuzzle);
  const selection = useSelector(selectSelection);
  const dispatch = useDispatch();
  const [height, setHeight] = useState<number>();

  // **WORKAROUND**
  // iOS does not yet support the meta viewport interactive-widget configuration options.
  // https://github.com/bramus/viewport-resize-behavior/blob/main/explainer.md#the-visual-viewport
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
    if (iOS) {
      const handleViewportResize = () => {
        setHeight(window.visualViewport?.height);
      };
      window.visualViewport?.addEventListener('resize', handleViewportResize);
      return () =>
        window.visualViewport?.removeEventListener(
          'resize',
          handleViewportResize,
        );
    }
  }, []);

  if (!puzzle) return null;

  const handleRotateSelectionClick = () => {
    // if element is already selected, "focus" event won't be triggered
    dispatch({ type: 'ROTATE_SELECTION' });
  };

  const [primaryClue] = useSelector(selectActiveClues);
  const clues = enumerateClues(puzzle);
  const clue = clues[selection.direction === 'row' ? 'across' : 'down'].find(
    (clue) => clue.number === primaryClue,
  );

  return (
    <div className={styles.container} style={{ height }}>
      <div className={styles.puzzle}>
        <PuzzleGrid />
      </div>
      <div className={styles.sticky}>
        {clue && <ClueCarousel index={clue.number} content={clue.clue} />}
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
              name={
                selection.direction === 'row'
                  ? 'text_rotate_vertical'
                  : 'text_rotation_none'
              }
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
