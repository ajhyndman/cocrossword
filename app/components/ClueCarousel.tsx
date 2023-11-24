import { memo } from 'react';
import { enumerateClues } from '@ajhyndman/puz';

import { getActiveClues } from '~/util/getActiveClues';
import { useSelector, useExecute } from '~/store/isomorphic';
import Clue from './Clue';
import styles from './ClueCarousel.module.css';

export default memo(function ClueCarousel() {
  const execute = useExecute();
  const puzzle = useSelector(({ remote }) => remote.puzzle);
  const selection = useSelector(({ local }) => local);

  if (!puzzle) return null;

  const [primaryClue] = getActiveClues(puzzle, selection);

  const clues = enumerateClues(puzzle);
  const clue = clues[selection.direction === 'row' ? 'across' : 'down'].find(
    (clue) => clue.number === primaryClue,
  );

  if (!clue) return null;

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={() => execute({ type: 'PREVIOUS_CLUE' })}>
        <span className="material-icons">arrow_left</span>
      </button>
      <div className={styles.center}>
        <Clue isActive content={clue.clue} index={clue.number} />
      </div>
      <button className={styles.button} onClick={() => execute({ type: 'NEXT_CLUE' })}>
        <span className="material-icons">arrow_right</span>
      </button>
    </div>
  );
});
