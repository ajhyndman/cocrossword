import { gridNumbering } from '@ajhyndman/puz';
import { useCallback, useEffect, useMemo } from 'react';

import { useExecute, useSelector } from '~/store/isomorphic';
import { getPrevIndex } from '~/util/cursor';
import { getActiveClues } from '~/util/getActiveClues';
import { getClueForSelection } from '~/util/getClueForSelection';
import styles from './PuzzleGrid.module.css';
import PuzzleCell from './PuzzleCell';

type Props = {
  userId: string;
};

export default function PuzzleGrid({ userId }: Props) {
  const isCorrect = useSelector(({ remote }) => remote.isCorrect);
  const users = useSelector(({ remote }) => remote.users);
  const selections = useSelector(({ remote }) => remote.selections);
  const puzzle = useSelector(({ remote }) => remote.puzzle);
  const selection = useSelector(({ local }) => local);
  const execute = useExecute();

  const solution = puzzle!.solution;
  const width = puzzle!.width;

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
  }, [userId, users, selections]);

  useEffect(() => {
    if (isCorrect) {
      window.alert('Congratulations!\n\nYou solved this puzzle.');
    }
  }, [isCorrect]);

  // clear selection on unmount or page hide
  useEffect(() => {
    const clearSelection = () =>
      execute({ type: 'USER_SELECTION_CLEARED', payload: { id: userId } });

    window.addEventListener('visibilitychange', clearSelection);
    return () => {
      clearSelection();
      window.removeEventListener('visibilitychange', clearSelection);
    };
  }, [execute, userId]);

  // derive clue to cell mappings
  const numbering = useMemo(() => gridNumbering({ solution, width }), [solution, width]);
  const activeClues = useMemo(
    () => getActiveClues({ solution, width }, selection),
    [solution, width, selection],
  );

  // handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        execute({ type: 'KEYBOARD_NAVIGATE', payload: { userId, key: event.key } });
        break;
      case 'Tab':
        event.preventDefault();
        if (event.shiftKey) execute({ type: 'PREVIOUS_CLUE', payload: { userId } });
        else execute({ type: 'NEXT_CLUE', payload: { userId } });
        break;
      case ' ':
        event.preventDefault();
        execute({ type: 'ROTATE_SELECTION' });
        break;
      default:
      // pass
    }
  };

  // cell event handlers
  const handleCellDelete = useCallback(
    (index: number, cellContent: false | string, backspace?: boolean) => {
      if (isCorrect) return;
      let deletedIndex = index;
      if (backspace && cellContent === false) {
        deletedIndex = getPrevIndex({ solution, width }, selection)!;
        execute({ type: 'RETREAT_CURSOR', payload: { userId } });
      }
      execute({ type: 'CELL_CHANGED', payload: { index: deletedIndex, value: '-' } });
    },
    [execute, solution, width, isCorrect, selection, userId],
  );
  const handleCellFocus = useCallback(
    (index: number) => {
      execute({ type: 'FOCUS', payload: { userId, index } });
    },
    [execute, userId],
  );
  const handleCellInput = useCallback(
    (index: number, value: string) => {
      if (isCorrect) return;

      if (value === '.') {
        execute({ type: 'TOGGLE_PENCIL' });
        return;
      }

      execute({
        type: 'CELL_CHANGED',
        payload: { index, value, isPencil: selection.isPencil },
      });
      execute({ type: 'ADVANCE_CURSOR', payload: { userId } });
    },
    [execute, isCorrect, selection.isPencil, userId],
  );
  const handleCellRotate = useCallback(() => {
    execute({ type: 'ROTATE_SELECTION' });
  }, [execute]);

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
            onDelete={handleCellDelete}
            onFocus={handleCellFocus}
            onInput={handleCellInput}
            onRotate={handleCellRotate}
          />
        );
      })}
    </div>
  );
}
