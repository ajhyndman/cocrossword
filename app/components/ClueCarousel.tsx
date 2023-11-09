import { memo } from 'react';
import { enumerateClues } from '@ajhyndman/puz';

import { useSelectionStore } from '~/store/local/selection';
import { useStore } from '~/store/remote';
import Clue from './Clue';
import styles from './ClueCarousel.module.css';
import { getActiveClues } from '~/util/getActiveClues';

export default memo(() => {
  const { dispatch, selection } = useSelectionStore();
  const {
    state: { puzzle },
  } = useStore();

  if (!puzzle) return null;

  const [primaryClue] = getActiveClues(puzzle, selection);

  const clues = enumerateClues(puzzle);
  const clue = clues[selection.direction === 'row' ? 'across' : 'down'].find(
    (clue) => clue.number === primaryClue,
  );

  if (!clue) return null;

  return (
    <div className={styles.appBar}>
      <button className={styles.button} onClick={() => dispatch({ type: 'PREVIOUS_CLUE' })}>
        <span className="material-icons">arrow_left</span>
      </button>
      <div className={styles.center}>
        <Clue isActive content={clue.clue} index={clue.number} />
      </div>
      <button className={styles.button} onClick={() => dispatch({ type: 'NEXT_CLUE' })}>
        <span className="material-icons">arrow_right</span>
      </button>
    </div>
  );
});
