import { useOutletContext } from '@remix-run/react';
import { createPortal } from 'react-dom';

import ClueCarousel from '~/components/ClueCarousel';
import PuzzleGrid from '~/components/PuzzleGrid';
import Toolbar from '~/components/Toolbar';
import { useSelector } from '~/store/isomorphic';
import styles from './$id.puzzle.module.css';
import type { OutletContext } from './$id';

export default function View() {
  const { bottomSheet } = useOutletContext<OutletContext>();
  const puzzle = useSelector(({ remote }) => remote.puzzle);

  if (!puzzle) return null;

  return (
    <>
      <div className={styles.puzzle}>
        <PuzzleGrid />
      </div>
      {createPortal(
        // @ts-expect-error type mismatch React.Node vs React.Element
        <>
          <Toolbar />
          <ClueCarousel />
        </>,
        bottomSheet.current,
      )}
    </>
  );
}
