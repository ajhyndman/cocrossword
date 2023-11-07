import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { useEffect, useState } from 'react';

import ClueCarousel from '~/components/ClueCarousel';
import PuzzleGrid from '~/components/PuzzleGrid';
import SolverAppBar from '~/components/SolverAppBar';
import { ActivityProvider } from '~/store/activity';
import { PuzzleProvider, loadPuzzleStore, usePuzzleStore } from '~/store/puzzle';
import { SelectionProvider } from '~/store/selection';
import { UsersProvider } from '~/store/users';
import { login } from '~/util/login.server';

import styles from './$id.puzzle.module.css';

export async function loader({ request, params }: LoaderFunctionArgs) {
  // if route doesn't match a real puzzle, redirect back to home
  if (!params.id) return redirect('/');
  const { getState } = await loadPuzzleStore(params.id);
  if (!getState().puzzle) return redirect('/');

  // otherwise ensure session and load route
  const cookie = request.headers.get('Cookie');
  return login(cookie, params.id!);
}

const View = ({ userId }: { userId: string }) => {
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

export default () => {
  const { id } = useParams();
  const { userId } = useLoaderData<typeof loader>();

  return (
    <UsersProvider KEY={id!}>
      <ActivityProvider KEY={id!}>
        <PuzzleProvider KEY={id!}>
          <View userId={userId} />
        </PuzzleProvider>
      </ActivityProvider>
    </UsersProvider>
  );
};
