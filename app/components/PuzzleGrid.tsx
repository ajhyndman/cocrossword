import { gridNumbering } from '@ajhyndman/puz';
import { useCallback, useEffect, useMemo } from 'react';

import { useSelectionStore } from '~/store/local/selection';
import { useStore } from '~/store/remote';
import { getPrevIndex } from '~/util/cursor';
import { getActiveClues } from '~/util/getActiveClues';
import { getClueForSelection } from '~/util/getClueForSelection';
import styles from './PuzzleGrid.module.css';
import PuzzleCell from './PuzzleCell';

type Props = {
  userId: string;
};

export default function PuzzleGrid({ userId }: Props) {
  const {
    dispatch: dispatchRemote,
    state: { isCorrect, users, selections, puzzle },
  } = useStore();
  const { dispatch, selection } = useSelectionStore();

  const selectionIndices = useMemo(() => {
    const selectionIndices: { color: string; name: string }[][] = [];
    Object.entries(selections).forEach(([id, index]) => {
      if (index == null || id === userId) return;
      const user = users[id];
      if (user) {
        if (!selectionIndices[index]) {
          selectionIndices[index] = [];
        }
        selectionIndices[index].push({ color: user.color, name: user.name });
      }
    });
    return selectionIndices;
  }, [users, selections]);

  useEffect(() => {
    if (isCorrect) {
      window.alert('Congratulations!\n\nYou solved this puzzle.');
    }
  }, [isCorrect]);

  useEffect(() => {
    // whenever selection updates, notify peers of new position
    if (selection.index != null) {
      dispatchRemote({
        type: 'USER_SELECTION_CHANGED',
        payload: { id: userId, index: selection.index! },
      });
    }
  }, [selection.index, userId]);

  // clear selection on unmount or page hide
  useEffect(() => {
    const clearSelection = () =>
      dispatchRemote({ type: 'USER_SELECTION_CLEARED', payload: { id: userId } });

    window.addEventListener('visibilitychange', clearSelection);
    return () => {
      clearSelection();
      window.removeEventListener('visibilitychange', clearSelection);
    };
  }, [userId]);

  // derive clue to cell mappings
  const numbering = useMemo(() => gridNumbering(puzzle!), [puzzle?.solution, puzzle?.width]);
  const activeClues = useMemo(
    () => getActiveClues(puzzle!, selection),
    [puzzle?.solution, puzzle?.width, selection],
  );

  // handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        dispatch({ type: 'KEYBOARD_NAVIGATE', payload: { key: event.key } });
        break;
      case 'Tab':
        event.preventDefault();
        if (event.shiftKey) dispatch({ type: 'PREVIOUS_CLUE' });
        else dispatch({ type: 'NEXT_CLUE' });
        break;
      case ' ':
        event.preventDefault();
        dispatch({ type: 'ROTATE_SELECTION' });
        break;
      default:
      // pass
    }
  };

  // cell event handlers
  const handleCellBackspace = useCallback(
    (index: number, cellContent: false | string) => {
      if (isCorrect) return;
      let deletedIndex = index;
      if (cellContent === false) {
        deletedIndex = getPrevIndex(puzzle!, selection)!;
        dispatch({ type: 'RETREAT_CURSOR' });
      }
      dispatchRemote({ type: 'CELL_CHANGED', payload: { index: deletedIndex, value: '-' } });
    },
    [dispatch, dispatchRemote, puzzle?.solution, isCorrect, selection],
  );
  const handleCellFocus = useCallback(
    (index: number) => {
      dispatch({ type: 'SELECT', payload: { index } });
    },
    [dispatch],
  );
  const handleCellInput = useCallback(
    (index: number, value: string) => {
      if (isCorrect) return;
      dispatchRemote({
        type: 'CELL_CHANGED',
        payload: { index, value, isPencil: selection.isPencil },
      });
      dispatch({ type: 'ADVANCE_CURSOR' });
    },
    [dispatch, dispatchRemote, isCorrect, selection.isPencil],
  );
  const handleCellRotate = useCallback(() => {
    dispatch({ type: 'ROTATE_SELECTION' });
  }, [dispatch]);

  return (
    <div
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(${puzzle!.width}, 33px)` }}
      onKeyDown={handleKeyDown}
    >
      {[...puzzle!.state!].map((char, i) => {
        const clueForCell = getClueForSelection(puzzle!, {
          index: i,
          direction: selection.direction,
        });
        const state =
          selection.index === i
            ? 'focus'
            : activeClues?.[0] === clueForCell
              ? 'secondary'
              : isCorrect
                ? 'solved'
                : undefined;

        return (
          <PuzzleCell
            key={i}
            index={i}
            number={numbering[i]}
            activeClues={activeClues}
            content={char}
            selections={selectionIndices[i]}
            state={state}
            markup={puzzle!.markupGrid?.[i]}
            onBackspace={handleCellBackspace}
            onFocus={handleCellFocus}
            onInput={handleCellInput}
            onRotate={handleCellRotate}
          />
        );
      })}
    </div>
  );
}
