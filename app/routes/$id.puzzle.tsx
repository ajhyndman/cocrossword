import { useOutletContext } from '@remix-run/react';

import ClueCarousel from '~/components/ClueCarousel';
import PuzzleGrid from '~/components/PuzzleGrid';
import { useStore } from '~/store/remote';
import { SelectionProvider } from '~/store/local/selection';
import styles from './$id.puzzle.module.css';
import Toolbar from '~/components/Toolbar';

export default function View() {
  const { userId } = useOutletContext<{ userId: string }>();
  const {
    state: { puzzle },
  } = useStore();

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
}
