import { useParams } from '@remix-run/react';
import { useEffect, useState } from 'react';

import ClueCarousel from '~/components/ClueCarousel';
import PuzzleGrid from '~/components/PuzzleGrid';
import SolverAppBar from '~/components/SolverAppBar';
import { PuzzleProvider, usePuzzleStore } from '~/store/puzzle';
import { SelectionProvider } from '~/store/selection';
import styles from './$id.puzzle.module.css';

const View = () => {
  const { puzzle } = usePuzzleStore();
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
      return () => window.visualViewport?.removeEventListener('resize', handleViewportResize);
    }
  }, []);

  if (!puzzle) return null;

  return (
    <SelectionProvider puzzle={puzzle}>
      <div className={styles.container} style={{ ...(height && { height }) }}>
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

export default () => {
  const { id } = useParams();

  return (
    <PuzzleProvider KEY={id!}>
      <View />
    </PuzzleProvider>
  );
};
