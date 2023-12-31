import { useEffect, useMemo, useState } from 'react';

import Title from '~/components/Title';
import { useSelector } from '~/store/isomorphic';
import styles from './d.$id._layout._index.module.css';
import PuzzleGrid from '~/components/PuzzleGrid';
import ClueList from '~/components/ClueList';

const DOCUMENT_GUTTER_SIZE = (5 + 3) * 16; // navigation rail + padding
const CLUE_HEIGHT = 39;
const CLUE_WIDTH = 16 * 16;
const CELL_WIDTH = 32 + 1;
const HEADER_HEIGHT = 80 + 48;

export default function View() {
  const puzzle = useSelector(({ remote }) => remote.puzzle);

  // use a state container as a mechanism for forcing rerenders
  const [, forceUpdate] = useState<Event>();

  const viewWidth = typeof document === 'undefined' ? 0 : window.innerWidth;

  // guess how tall <main> needs to be to fit all clues within client width
  const height = useMemo(() => {
    if (!puzzle) return 0;

    const puzzleSize = puzzle.width * CELL_WIDTH + 3;
    const viewportWidth = viewWidth - DOCUMENT_GUTTER_SIZE;
    const floatWidth = puzzleSize;
    const targetWidth = Math.max(viewportWidth, floatWidth);

    const numTotalCols = Math.floor(targetWidth / CLUE_WIDTH);
    const numShortCols = Math.min(numTotalCols, Math.ceil(floatWidth / CLUE_WIDTH));
    const numClues = puzzle.clues.length + 2; // add 2 to make space for headings

    // num clues displaced by puzzle block
    const numCluesDisplaced = Math.ceil(puzzleSize / CLUE_HEIGHT) * numShortCols;

    // resulting clues per col
    const numCluesPerCol = Math.ceil((numClues + numCluesDisplaced) / numTotalCols);

    // compute height
    return numCluesPerCol * CLUE_HEIGHT;
  }, [puzzle, viewWidth]);

  useEffect(() => {
    window.addEventListener('resize', forceUpdate);
    return () => window.removeEventListener('resize', forceUpdate);
  }, []);

  if (!puzzle) return;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Title>{puzzle.title}</Title>
        <p className={styles.byline}>
          <cite>
            {puzzle.author} — {puzzle.copyright}
          </cite>
        </p>
      </header>
      <main
        className={styles.main}
        style={{
          height: height ? Math.max(height, window.innerHeight - HEADER_HEIGHT) : undefined,
        }}
      >
        <div className={styles.float}>
          <div>
            <PuzzleGrid />
          </div>
          {/* <aside className={styles.outlet}>
            <Outlet context={context} />
          </aside> */}
        </div>
        <ClueList />
      </main>
    </div>
  );
}
