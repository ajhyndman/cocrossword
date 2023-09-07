import React, { useEffect, useRef } from 'react';
import type { Dispatch } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import cx from 'classnames';

import styles from './PuzzleCell.module.css';
import {
  selectPuzzle,
  selectSelection,
  selectActiveClues,
} from '../store/selectors';
import { Action } from '../store/types';
import { getClueForSelection } from '../util/getClueForSelection';

type Props = {
  number?: number;
  index: number;
  content: string;
  onChange?: (event: React.ChangeEvent) => void;
};

export default ({ index, number, content }: Props) => {
  const puzzle = useSelector(selectPuzzle);
  const selection = useSelector(selectSelection);
  const dispatch = useDispatch<Dispatch<Action>>();
  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);

  const clues = useSelector(selectActiveClues);
  const clueForCell = getClueForSelection(puzzle!, {
    index,
    direction: selection.direction,
  });

  const state =
    selection.index === index
      ? 'focus'
      : clues?.[0] === clueForCell
      ? 'secondary'
      : undefined;
  const isBlackCell = content === '.';
  const cellContent = !isBlackCell && content !== '-' && content;

  const handleFocus = (event: React.FocusEvent) => {
    dispatch({ type: 'SELECT', payload: { index } });
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleChange');
    event.preventDefault();
    inputRef.current?.select();
    const value = event.target.value.slice(-1).toUpperCase();
    dispatch({ type: 'INPUT', payload: { value } });
  };
  const handleClick = (event: React.MouseEvent) => {
    // if element is already selected, "focus" event won't be triggered
    if (selection.index === index && event.target === labelRef.current) {
      dispatch({ type: 'ROTATE_SELECTION' });
    }
  };

  useEffect(() => {
    if (selection.index === index) {
      inputRef.current?.select();
      inputRef.current?.focus();
    }
  }, [selection.index]);

  return (
    <label
      ref={labelRef}
      onClick={handleClick}
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
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          ref={inputRef}
          className={styles.input}
          onChange={handleChange}
          onFocus={handleFocus}
          value={cellContent || '-'}
        ></input>
      )}
    </label>
  );
};
