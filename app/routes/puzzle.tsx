import { useEffect, useState } from 'react';

import ClueCarousel from '~/components/ClueCarousel';
import PuzzleGrid from '~/components/PuzzleGrid';
import SolverAppBar from '~/components/SolverAppBar';
import { usePuzzleContext } from '~/store/puzzle';
import { SelectionProvider } from '~/store/selection';
import { useEventSourceReducer } from '~/util/useEventSourceReducer';
import styles from './puzzle.module.css';

export default () => {
  const { dispatch, puzzle } = usePuzzleContext();
  const [height, setHeight] = useState<number>();

  useEventSourceReducer('/kafka/sse', 'ACTION', (state, event: string) => {
    try {
      console.log(event);
      const action = JSON.parse(event);
      action.payload = JSON.parse(action.payload);
      dispatch(action);
    } catch (e) {
      console.warn(e);
    }
  });

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
      return () => window.visualViewport?.removeEventListener('resize', handleViewportResize);
    }
  }, []);

  if (!puzzle) return null;

  return (
    <SelectionProvider puzzle={puzzle}>
      <div className={styles.container} style={{ height }}>
        <div className={styles.puzzle}>
          <PuzzleGrid />
        </div>
        <div className={styles.sticky}>
          <ClueCarousel />
          <SolverAppBar />
        </div>
        {/* simply having a position: fixed element on the page fixes a bug with
            position: sticky on some browsers.
            @see: https://www.stevefenton.co.uk/blog/2022/12/mobile-position-sticky-issue/ */}
        <div className={styles.fixed} />
      </div>
    </SelectionProvider>
  );
};
