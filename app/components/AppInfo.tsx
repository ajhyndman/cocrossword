import type { ReactNode } from 'react';

import styles from './AppInfo.module.css';

function Keycap({ children }: { children: ReactNode }) {
  return <kbd className={styles.keycap}>{children}</kbd>;
}

export default function AppInfo() {
  return (
    <>
      <ul className={styles.list}>
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
    </>
  );
}
