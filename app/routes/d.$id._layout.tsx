import { Outlet, useOutletContext } from '@remix-run/react';
import { useMemo } from 'react';

import NavigationRail from '~/components/NavigationRail';
import PuzzleGrid from '~/components/PuzzleGrid';
import Title from '~/components/Title';
import { useSelector } from '~/store/isomorphic';
import styles from './d.$id._layout.module.css';
import ClueList from '~/components/ClueList';

const DOCUMENT_GUTTER_SIZE = (5 + 3) * 16; // navigation rail + padding
const CLUE_HEIGHT = 40;
const CLUE_WIDTH = 15 * 16;
const CELL_WIDTH = 32 + 1;
const OUTLET_WIDTH = 27 * 16;

export default function View() {
  const context = useOutletContext();
  const puzzle = useSelector(({ remote }) => remote.puzzle);

  // guess how tall <main> needs to be to fit all clues within client width
  const height = useMemo(() => {
    if (typeof document === 'undefined' || !puzzle) return;

    const puzzleSize = puzzle.width * CELL_WIDTH + 3;
    const viewportWidth = window.innerWidth - DOCUMENT_GUTTER_SIZE;
    const floatWidth = OUTLET_WIDTH + puzzleSize;
    const targetWidth = Math.max(viewportWidth, floatWidth);
    console.log({ viewportWidth, floatWidth, targetWidth });

    const numTotalCols = Math.floor(targetWidth / CLUE_WIDTH);
    const numShortCols = Math.min(numTotalCols, Math.ceil(floatWidth / CLUE_WIDTH));
    // const numLongCols = numTotalCols - numShortCols;
    const numClues = puzzle.clues.length + 2; // add 2 to make space for headings

    console.log({ numShortCols, numTotalCols });

    // num clues displaced by puzzle block
    const numCluesDisplaced = Math.ceil(puzzleSize / CLUE_HEIGHT) * numShortCols;

    console.log({ numCluesDisplaced });

    // resulting clues per col
    const numCluesPerCol = Math.ceil((numClues + numCluesDisplaced) / numTotalCols);

    console.log({ numCluesPerCol });

    // compute height
    return numCluesPerCol * CLUE_HEIGHT;
  }, [puzzle]);

  console.log({ height });

  if (!puzzle) return null;

  return (
    <>
      <NavigationRail />
      <div className={styles.container}>
        <header className={styles.header}>
          <Title>{puzzle.title}</Title>
          <p className={styles.byline}>
            <cite>
              {puzzle.author} — {puzzle.copyright}
            </cite>
          </p>
        </header>
        <main className={styles.main} style={{ height }}>
          <div className={styles.float}>
            <div>
              <PuzzleGrid />
            </div>
            <aside className={styles.outlet}>
              <Outlet context={context} />
            </aside>
          </div>
          <ClueList />
        </main>
      </div>
    </>
  );
}
