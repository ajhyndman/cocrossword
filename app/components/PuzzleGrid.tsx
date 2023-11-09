import { gridNumbering } from '@ajhyndman/puz';
import { useEffect, useMemo } from 'react';

import { useActivityStore } from '~/store/activity';
import { usePuzzleStore } from '~/store/puzzle';
import { useSelectionStore } from '~/store/selection';
import { getActiveClues } from '~/util/getActiveClues';
import styles from './PuzzleGrid.module.css';
import PuzzleCell from './PuzzleCell';
import { useUsersStore } from '~/store/users';

type Props = {
  userId: string;
};

export default ({ userId }: Props) => {
  const {
    state: { users },
  } = useUsersStore();
  const { puzzle } = usePuzzleStore();
  const { dispatch, selection } = useSelectionStore();
  const {
    dispatch: dispatchActivity,
    state: { selections },
  } = useActivityStore();

  const selectionIndices = useMemo(() => {
    const selectionIndices: string[][] = [];
    Object.entries(selections).forEach(([id, index]) => {
      if (index == null || id === userId) return;
      if (!selectionIndices[index]) {
        selectionIndices[index] = [];
      }
      const color = users[id].color;
      selectionIndices[index].push(color);
    });
    return selectionIndices;
  }, [users, selections]);

  useEffect(() => {
    // whenever selection updates, notify peers of new position
    if (selection.index == null) {
      dispatchActivity({ type: 'USER_SELECTION_CLEARED', payload: { id: userId } });
    } else {
      dispatchActivity({
        type: 'USER_SELECTION_CHANGED',
        payload: { id: userId, index: selection.index! },
      });
    }
  }, [selection.index]);

  if (!puzzle) return null;
  const numbering = gridNumbering(puzzle);

  const activeClues = getActiveClues(puzzle, selection);

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

  return (
    <div
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(${puzzle.width}, 33px)` }}
      onKeyDown={handleKeyDown}
    >
      {[...puzzle.state!].map((char, i) => {
        return (
          <PuzzleCell
            key={i}
            index={i}
            number={numbering[i]}
            activeClues={activeClues}
            content={char}
            selections={selectionIndices[i]}
          />
        );
      })}
    </div>
  );
};
