import { gridNumbering } from '@ajhyndman/puz';

import { usePuzzleStore } from '~/store/puzzle';
import { useSelectionStore } from '~/store/selection';
import styles from './PuzzleGrid.module.css';
import PuzzleCell from './PuzzleCell';

export default () => {
  const { puzzle } = usePuzzleStore();
  const { dispatch } = useSelectionStore();

  if (!puzzle) return null;
  const numbering = gridNumbering(puzzle);

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
      {[...puzzle.state!].map((char, i) => (
        <PuzzleCell key={i} index={i} number={numbering[i]} content={char} />
      ))}
    </div>
  );
};
