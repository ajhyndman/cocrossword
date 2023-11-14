import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useOutletContext } from '@remix-run/react';

import ClueCarousel from '~/components/ClueCarousel';
import PuzzleGrid from '~/components/PuzzleGrid';
import { loadStore, useStore } from '~/store/remote';
import { SelectionProvider } from '~/store/local/selection';

import styles from './$id.puzzle.module.css';
import Toolbar from '~/components/Toolbar';

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

  console.log(puzzle);

  if (!puzzle) return null;

  return (
    <SelectionProvider puzzle={puzzle}>
      <div className={styles.puzzle}>
        <PuzzleGrid userId={userId} />
      </div>
      <div className={styles.sticky}>
        <Toolbar />
        <ClueCarousel />
      </div>
    </SelectionProvider>
  );
};
