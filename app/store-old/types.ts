import type { Puzzle } from '@ajhyndman/puz';

// aggregate
export type State = {
  puzzle?: Puzzle;
  selection: {
    index?: number;
    direction: 'column' | 'row';
  };
};

// actions
export type Action =
  | { type: 'NEW_PUZZLE'; payload: Puzzle }
  | { type: 'ADVANCE_CURSOR'; payload?: undefined }
  | { type: 'RETREAT_CURSOR'; payload?: undefined }
  | { type: 'INPUT'; payload: { value: string } }
  | { type: 'BACKSPACE'; payload?: undefined }
  | {
      type: 'KEYBOARD_NAVIGATE';
      payload: {
        key: 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp';
      };
    }
  | { type: 'PREVIOUS_CLUE'; payload?: undefined }
  | { type: 'NEXT_CLUE'; payload?: undefined }
  | { type: 'ROTATE_SELECTION'; payload?: undefined }
  | { type: 'SELECT'; payload: { index: number } };
