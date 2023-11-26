import { enumerateClues } from '@ajhyndman/puz';
import { useOutletContext } from '@remix-run/react';

import { OutletContext } from '~/routes/$id';
import { useExecute, useSelector } from '~/store/isomorphic';
import Clue from '~/components/Clue';
import Title from '~/components/Title';
import styles from './ClueList.module.css';

export default function ClueList() {
  const { userId } = useOutletContext<OutletContext>();
  const execute = useExecute();
  const puzzle = useSelector(({ remote }) => remote.puzzle)!;
  const selection = useSelector(({ local }) => local);

  const clues = enumerateClues(puzzle!);
  // const clue = clues[selection.direction === 'row' ? 'across' : 'down'].find(
  //   (clue) => clue.number === primaryClue,
  // );

  return (
    <>
      {/* <ul className={styles.list}> */}
      <h3 className={styles.title}>ACROSS</h3>
      {clues.across.map((clue) => (
        <li key={clue.number} className={styles.listItem}>
          <Clue index={clue.number} content={clue.clue} />
        </li>
      ))}
      <h3 className={styles.title}>DOWN</h3>
      {clues.down.map((clue) => (
        <li key={clue.number} className={styles.listItem}>
          <Clue index={clue.number} content={clue.clue} />
        </li>
      ))}
      {/* </ul> */}
    </>
  );
}
