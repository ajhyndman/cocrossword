import { SquareMarkup } from '@ajhyndman/puz';
import { useOutletContext } from '@remix-run/react';
import { memo, useLayoutEffect, useRef } from 'react';
import cx from 'classnames';

import styles from './PuzzleCell.module.css';
import { useExecute } from '~/store/isomorphic';
import { OutletContext } from '~/routes/$id';

type Props = {
  activeClues: number[];
  content: string;
  index: number;
  number?: number;
  selections?: { color: string; name: string }[];
  state?: 'focus' | 'secondary' | 'solved';
  markup?: SquareMarkup;
};

export default memo(function PuzzleCell({
  index,
  number,
  content,
  state,
  selections,
  markup,
}: Props) {
  const { userId } = useOutletContext<OutletContext>();
  const execute = useExecute();
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);

  const isBlackCell = content === '.';
  const cellContent = !isBlackCell && content !== '-' && content;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      execute({ type: 'DELETE', payload: { index, userId, backspace: event.key === 'Backspace' } });
    }
  };
  const handleClick = (event: React.MouseEvent) => {
    // if element is already selected, "focus" event won't be triggered
    if (state === 'focus' && event.target === labelRef.current) {
      execute({ type: 'ROTATE_SELECTION' });
    }
  };
  const handleFocus = () => {
    execute({ type: 'FOCUS', payload: { userId, index } });
  };
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    // @ts-expect-error TS doesn't guarantee that nativeEvent.data is present
    const value = event.nativeEvent.data;
    // onInput(index, value);

    execute({ type: 'INPUT', payload: { userId, index, value } });
  };

  useLayoutEffect(() => {
    if (state === 'focus') {
      inputRef.current?.focus();
    }
  }, [state]);

  return (
    <label
      ref={labelRef}
      onClick={handleClick}
      className={cx(styles.cell, {
        [styles.focus]: state === 'focus',
        [styles.active]: state === 'secondary',
        [styles.solved]: state === 'solved',
        [styles.black]: isBlackCell,
        [styles.circled]: markup?.circled,
        [styles.incorrect]: markup?.incorrect,
        [styles.revealed]: markup?.revealed,
        [styles.pencil]: markup?.unknown_08,
        [styles.starred]: markup?.unknown_04,
      })}
    >
      {number && <span className={styles.number}>{number}</span>}
      {cellContent && (
        <span className={styles.content} aria-hidden>
          {cellContent.toLocaleUpperCase()}
          {markup?.unknown_04 && <sup className={styles.superscript}>*</sup>}
        </span>
      )}
      {selections && (
        <div className={styles.cursors}>
          {selections.map(({ color, name }) => (
            <div
              key={color}
              title={name}
              className={styles.cursor}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
      {!isBlackCell && (
        <input
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          aria-expanded={false}
          role="textbox"
          ref={inputRef}
          className={styles.input}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onFocus={handleFocus}
          value=""
          type="search"
        ></input>
      )}
    </label>
  );
});
