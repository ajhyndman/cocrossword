import type { ReactNode } from 'react';

import Title from '~/components/Title';
import { useSelector } from '~/store/isomorphic';
import { asciiToBlackLetter } from '~/util/asciiToBlackletter';
import styles from './$id.info.module.css';

function Keycap({ children }: { children: ReactNode }) {
  return <kbd className={styles.keycap}>{children}</kbd>;
}

export default function View() {
  const puzzle = useSelector(({ remote }) => remote.puzzle);
  const title = asciiToBlackLetter(puzzle?.title);

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <Title>Puzzle Info</Title>
        <div className={styles.puzzleInfo}>
          <h2 className={styles.puzzleTitle}>{title}</h2>
          <p>{puzzle?.author}</p>
          <p>{puzzle?.copyright}</p>
        </div>
      </div>
      <div className={styles.section}>
        <Title>App Info</Title>
        <Title tag="h2">Keyboard shortcuts</Title>
        <ul className={styles.shortcutList}>
          <li>
            <span>Allowed Solutions</span>{' '}
            <span className={styles.keys}>
              <Keycap>A–Z</Keycap>, <Keycap>0–9</Keycap>, <Keycap>@</Keycap>, <Keycap>#</Keycap>,{' '}
              <Keycap>$</Keycap>, <Keycap>%</Keycap>, <Keycap>&</Keycap>, <Keycap>+</Keycap>,{' '}
              <Keycap>?</Keycap>
            </span>
          </li>
          <li>
            <span>Rotate Selection</span> <Keycap>Space</Keycap>
          </li>
          <li>
            <span>Toggle Pencil Mode</span> <Keycap>.</Keycap>
          </li>
          <li>
            <span>Clear square</span>{' '}
            <span className={styles.keys}>
              <Keycap>Backspace</Keycap>, <Keycap>Delete</Keycap>
            </span>
          </li>
          <li>
            <span>Move cursor</span>{' '}
            <span className={styles.keys}>
              <Keycap>←</Keycap>, <Keycap>↑</Keycap>, <Keycap>→</Keycap>, <Keycap>↓</Keycap>
            </span>
          </li>
          <li>
            <span>Next clue</span> <Keycap>Tab</Keycap>
          </li>
          <li>
            <span>Previous clue</span>{' '}
            <span className={styles.keys}>
              <Keycap>Shift</Keycap> + <Keycap>Tab</Keycap>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
