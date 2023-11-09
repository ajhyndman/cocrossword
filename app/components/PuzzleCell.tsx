import { memo, useLayoutEffect, useRef } from 'react';
import cx from 'classnames';

import { useSelectionStore } from '~/store/local/selection';
import { useStore } from '~/store/remote';
import { getPrevIndex } from '~/util/cursor';
import { getClueForSelection } from '~/util/getClueForSelection';
import styles from './PuzzleCell.module.css';

type Props = {
  activeClues: number[];
  content: string;
  index: number;
  number?: number;
  selections?: string[];
};

export default memo(({ activeClues, index, number, content, selections }: Props) => {
  const { dispatch, selection } = useSelectionStore();
  const {
    dispatch: dispatchKafka,
    state: { puzzle },
  } = useStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);

  const clueForCell = getClueForSelection(puzzle!, {
    index,
    direction: selection.direction,
  });
  const state =
    selection.index === index
      ? 'focus'
      : activeClues?.[0] === clueForCell
      ? 'secondary'
      : undefined;
  const isBlackCell = content === '.';
  const cellContent = !isBlackCell && content !== '-' && content;

  if (!puzzle) return null;

  const handleBackspace = (event: React.KeyboardEvent) => {
    if (event.key === 'Backspace') {
      let deletedIndex = index;
      if (cellContent === false) {
        deletedIndex = getPrevIndex(puzzle, selection)!;
        dispatch({ type: 'RETREAT_CURSOR' });
      }
      dispatchKafka({ type: 'CELL_CHANGED', payload: { index: deletedIndex, value: '-' } });
    }
  };
  const handleFocus = (event: React.FocusEvent) => {
    dispatch({ type: 'SELECT', payload: { index } });
  };
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    // @ts-ignore TS doesn't guarantee that nativeEvent.data is present
    const value = event.nativeEvent.data;
    dispatchKafka({ type: 'CELL_CHANGED', payload: { index, value } });
    dispatch({ type: 'ADVANCE_CURSOR' });
  };
  const handleClick = (event: React.MouseEvent) => {
    // if element is already selected, "focus" event won't be triggered
    if (selection.index === index && event.target === labelRef.current) {
      dispatch({ type: 'ROTATE_SELECTION' });
    }
  };

  useLayoutEffect(() => {
    if (selection.index === index) {
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
      {selections && (
        <div className={styles.cursors}>
          {selections.map((color) => (
            <div key={color} className={styles.cursor} style={{ backgroundColor: color }} />
          ))}
        </div>
      )}
      {!isBlackCell && (
        <input
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          ref={inputRef}
          className={styles.input}
          onKeyDown={handleBackspace}
          onInput={handleInput}
          onFocus={handleFocus}
          value=""
        ></input>
      )}
    </label>
  );
});
