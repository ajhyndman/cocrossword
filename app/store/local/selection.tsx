import type { Puzzle } from '@ajhyndman/puz';
import type { ReactNode } from 'react';

import { createStore } from '~/store/redux-lite';

export type Selection = {
  readonly index?: number;
  readonly direction: 'column' | 'row';
  readonly isPencil?: boolean;
  readonly isToolbarExpanded?: boolean;
};

export type SelectionAction =
  | { type: 'SELECT'; payload: { index: number } }
  | { type: 'ROTATE_SELECTION'; payload?: undefined }
  | { type: 'TOGGLE_PENCIL'; payload?: undefined }
  | { type: 'TOGGLE_TOOLBAR'; payload?: undefined };

export const DEFAULT_SELECTION: Selection = { direction: 'row' };

export const reducer = (state: Selection, { type, payload }: SelectionAction) => {
  switch (type) {
    case 'SELECT': {
      return { ...state, index: payload.index };
    }

    case 'ROTATE_SELECTION': {
      return {
        ...state,
        direction: state.direction === 'row' ? ('column' as const) : ('row' as const),
      };
    }

    case 'TOGGLE_PENCIL': {
      return { ...state, isPencil: !state.isPencil };
    }

    case 'TOGGLE_TOOLBAR': {
      return { ...state, isToolbarExpanded: !state.isToolbarExpanded };
    }

    default:
      return state;
  }
};

const { Provider, useStore } = createStore<Selection, SelectionAction>((a) => a, DEFAULT_SELECTION);

export const SelectionProvider = ({ children }: { puzzle: Puzzle; children: ReactNode }) => (
  <Provider reducer={reducer}>{children}</Provider>
);

export const useSelectionStore = () => {
  const { dispatch, state } = useStore();
  return { dispatch, selection: state };
};
