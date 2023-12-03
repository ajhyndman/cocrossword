import { SquareMarkup } from '@ajhyndman/puz';
import { useOutletContext } from '@remix-run/react';
import { memo, useLayoutEffect, useRef, useState } from 'react';
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
  state?: 'selected' | 'secondary';
  solved?: boolean;
  markup?: SquareMarkup;
};

export default memo(function PuzzleCell({
  index,
  number,
  content,
  selections,
  state,
  solved,
  markup,
}: Props) {
  const { userId } = useOutletContext<OutletContext>();
  const [isFocused, setIsFocused] = useState(false);
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
  const handleBlur = () => {
    setIsFocused(false);
  };
  const handleClick = (event: React.MouseEvent) => {
    // if element is already selected, "focus" event won't be triggered
    if (isFocused && event.target === labelRef.current) {
      execute({ type: 'ROTATE_SELECTION' });
    }
  };
  const handleFocus = () => {
    setIsFocused(true);
    execute({ type: 'FOCUS', payload: { userId, index } });
  };
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    // @ts-expect-error TS doesn't guarantee that nativeEvent.data is present
    const value = event.nativeEvent.data;
    // onInput(index, value);

    execute({ type: 'INPUT', payload: { userId, index, value } });
  };
  const handleMouseDown = (event: React.MouseEvent) => {
    // prevent mousedown from immediately stealing focus
    event.preventDefault();
  };

  useLayoutEffect(() => {
    if (state === 'selected') {
      inputRef.current?.focus();
    }
  }, [state]);

  return (
    <label
      ref={labelRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      className={cx(styles.cell, {
        [styles.selected]: state === 'selected',
        [styles.focus]: isFocused,
        [styles.active]: state === 'secondary',
        [styles.solved]: solved,
        [styles.black]: isBlackCell,
        [styles.circled]: markup?.circled,
        [styles.incorrect]: markup?.incorrect,
        [styles.revealed]: markup?.revealed,
        [styles.pencil]: markup?.penciled,
        [styles.starred]: markup?.unknown_04,
      })}
      style={{
        animationDelay: `${0.0125 * index}s`,
      }}
    >
      {number && <span className={styles.number}>{number}</span>}
      <span className={styles.content}>
        {cellContent && cellContent.toLocaleUpperCase()}
        {markup?.unknown_04 && <sup className={styles.superscript}>*</sup>}
      </span>
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
          onBlur={handleBlur}
          onFocus={handleFocus}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          value=""
          type="search"
        ></input>
      )}
    </label>
  );
});
