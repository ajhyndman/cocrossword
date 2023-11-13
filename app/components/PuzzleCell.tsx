import { memo, useLayoutEffect, useRef } from 'react';
import cx from 'classnames';

import styles from './PuzzleCell.module.css';

type Props = {
  activeClues: number[];
  content: string;
  index: number;
  number?: number;
  state?: 'focus' | 'secondary' | 'solved';
  selections?: { color: string; name: string }[];
  onBackspace: (index: number, cellContent: false | string) => void;
  onFocus: (index: number) => void;
  onInput: (index: number, value: string) => void;
  onRotate: () => void;
};

export default memo(
  ({
    index,
    number,
    content,
    state,
    selections,
    onBackspace,
    onFocus,
    onInput,
    onRotate,
  }: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const labelRef = useRef<HTMLLabelElement>(null);

    const isBlackCell = content === '.';
    const cellContent = !isBlackCell && content !== '-' && content;

    const handleBackspace = (event: React.KeyboardEvent) => {
      if (event.key === 'Backspace') {
        onBackspace(index, cellContent);
      }
    };
    const handleFocus = (event: React.FocusEvent) => {
      onFocus(index);
    };
    const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
      // @ts-ignore TS doesn't guarantee that nativeEvent.data is present
      const value = event.nativeEvent.data;
      onInput(index, value);
    };
    const handleClick = (event: React.MouseEvent) => {
      // if element is already selected, "focus" event won't be triggered
      if (state === 'focus' && event.target === labelRef.current) {
        onRotate();
      }
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
        })}
      >
        {number && <span className={styles.number}>{number}</span>}
        {cellContent && (
          <span className={styles.content} aria-hidden>
            {cellContent}
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
            onKeyDown={handleBackspace}
            onInput={handleInput}
            onFocus={handleFocus}
            value=""
            type="search"
          ></input>
        )}
      </label>
    );
  },
);
