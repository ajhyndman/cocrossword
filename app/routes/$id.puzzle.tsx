import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useOutletContext } from '@remix-run/react';
import { useEffect, useState } from 'react';

import ClueCarousel from '~/components/ClueCarousel';
import PuzzleGrid from '~/components/PuzzleGrid';
import SolverAppBar from '~/components/SolverAppBar';
import { loadStore, useStore } from '~/store/remote';
import { SelectionProvider } from '~/store/local/selection';

import styles from './$id.puzzle.module.css';

export async function loader({ params }: LoaderFunctionArgs) {
  // if route doesn't match a real puzzle, redirect back to home
  if (!params.id) return redirect('/');
  const { getState } = await loadStore(params.id);
  if (!getState().puzzle) return redirect('/');

  return null;
}

export default () => {
  const { userId } = useOutletContext<{ userId: string }>();
  const {
    state: { puzzle },
  } = useStore();
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
          <PuzzleGrid userId={userId} />
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
