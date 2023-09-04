import React from 'react';
import cx from 'classnames';

import styles from './PuzzleCell.module.css';

type Props = {
  number?: number;
  content: string;
  state?: 'focus' | 'secondary';
  onChange?: (event: React.ChangeEvent) => void;
};

export default ({ number, content, onChange, state }: Props) => {
  const isBlackCell = content === '.';

  const cellContent = !isBlackCell && content !== '-' && content;

  return (
    <label
      className={cx(styles.cell, {
        [styles.focus]: state === 'focus',
        [styles.active]: state === 'secondary',
        [styles.black]: isBlackCell,
      })}
    >
      {number && <span className={styles.number}>{number}</span>}
      {cellContent && (
        <span className={styles.content} aria-hidden>
          {cellContent}
        </span>
      )}
      {!isBlackCell && (
        <input
          className={styles.input}
          onChange={onChange}
          value={cellContent || undefined}
        ></input>
      )}
    </label>
  );
};
