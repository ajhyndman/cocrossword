import { gridNumbering } from '@ajhyndman/puz';
import { useOutletContext } from '@remix-run/react';
import classNames from 'classnames';
import { useEffect, useMemo } from 'react';

import { useExecute, useSelector } from '~/store/isomorphic';
import { getActiveClues } from '~/util/getActiveClues';
import { getClueForSelection } from '~/util/getClueForSelection';
import styles from './PuzzleGrid.module.css';
import PuzzleCell from './PuzzleCell';
import { OutletContext } from '~/routes/$id';

export default function PuzzleGrid() {
  const { userId } = useOutletContext<OutletContext>();
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

  return (
    <div
      className={classNames(styles.grid, { [styles.solved]: isCorrect })}
      style={{ gridTemplateColumns: `repeat(${puzzle!.width}, calc(2rem + 1px))` }}
      onKeyDown={handleKeyDown}
    >
      {[...puzzle!.state!].map((char, i) => {
        const clueForCell = getClueForSelection(puzzle!, {
          index: i,
          direction: selection.direction,
        });
        const state =
          selection.index === i
            ? 'selected'
            : activeClues?.[0] === clueForCell
              ? 'secondary'
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
            solved={isCorrect}
            markup={puzzle!.markupGrid?.[i]}
          />
        );
      })}
    </div>
  );
}
