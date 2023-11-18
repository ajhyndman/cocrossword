import { useOutletContext } from '@remix-run/react';
import { createPortal } from 'react-dom';

import ClueCarousel from '~/components/ClueCarousel';
import PuzzleGrid from '~/components/PuzzleGrid';
import Toolbar from '~/components/Toolbar';
import { useStore } from '~/store/remote';
import { SelectionProvider } from '~/store/local/selection';
import styles from './$id.puzzle.module.css';
import type { OutletContext } from './$id';

export default function View() {
  const { bottomSheet, userId } = useOutletContext<OutletContext>();
  const {
    state: { puzzle },
  } = useStore();

  if (!puzzle) return null;

  return (
    <SelectionProvider puzzle={puzzle}>
      <div className={styles.puzzle}>
        <PuzzleGrid userId={userId} />
      </div>
      {createPortal(
        // @ts-expect-error type mismatch React.Node vs React.Element
        <>
          <Toolbar />
          <ClueCarousel />
        </>,
        bottomSheet.current,
      )}
    </SelectionProvider>
  );
}
