import { enumerateClues } from '@ajhyndman/puz';
import { memo, useCallback } from 'react';

import { useExecute, useSelector } from '~/store/isomorphic';
import Clue from '~/components/Clue';
import styles from './ClueList.module.css';
import { getActiveClues } from '~/util/getActiveClues';

export default memo(function ClueList() {
  const execute = useExecute();
  const solution = useSelector(({ remote }) => remote.puzzle!.solution)!;
  const clues = useSelector(({ remote }) => remote.puzzle!.clues)!;
  const width = useSelector(({ remote }) => remote.puzzle!.width)!;
  const selection = useSelector(({ local }) => local);

  const numberedClues = enumerateClues({ solution, width, clues });
  const [primaryClue, secondaryClue] = getActiveClues({ solution, width }, selection);

  const handleClick = useCallback(
    (direction: 'ACROSS' | 'DOWN', number: number) => () => {
      execute({ type: 'SELECT_CLUE', payload: { number, direction } });
    },
    [execute],
  );

  return (
    <>
      <h3 className={styles.title}>ACROSS</h3>
      {numberedClues.across.map((clue) => {
        const state =
          selection.direction === 'row' && clue.number === primaryClue
            ? 'primary'
            : selection.direction === 'column' && clue.number === secondaryClue
              ? 'secondary'
              : undefined;
        return (
          <li key={clue.number} className={styles.listItem}>
            <button className={styles.button} onClick={handleClick('ACROSS', clue.number)}>
              <Clue index={clue.number} content={clue.clue} state={state} />
            </button>
          </li>
        );
      })}
      <h3 className={styles.title}>DOWN</h3>
      {numberedClues.down.map((clue) => {
        const state =
          selection.direction === 'column' && clue.number === primaryClue
            ? 'primary'
            : selection.direction === 'row' && clue.number === secondaryClue
              ? 'secondary'
              : undefined;
        return (
          <li key={clue.number} className={styles.listItem}>
            <button className={styles.button} onClick={handleClick('DOWN', clue.number)}>
              <Clue index={clue.number} content={clue.clue} state={state} />
            </button>
          </li>
        );
      })}
    </>
  );
});
