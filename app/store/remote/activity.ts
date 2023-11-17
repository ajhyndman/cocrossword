export type State = {
  selections: {
    // the index the user currently has selected
    [id: string]: number | undefined;
  };
  readReceipts: {
    // the last message index the user has seen
    [id: string]: number | undefined;
  };
};

export type Action =
  | {
      type: 'USER_SELECTION_CHANGED';
      payload: {
        id: string;
        index: number;
      };
    }
  | {
      type: 'USER_SELECTION_CLEARED';
      payload: {
        id: string;
      };
    }
  | {
      type: 'READ_MESSAGE';
      payload: {
        id: string;
        index: number;
      };
    };

export const DEFAULT_STATE: State = {
  selections: {},
  readReceipts: {},
};

export const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case 'USER_SELECTION_CHANGED':
      return { ...state, selections: { ...state.selections, [payload.id]: payload.index } };

    case 'USER_SELECTION_CLEARED':
      return { ...state, selections: { ...state.selections, [payload.id]: undefined } };

    case 'READ_MESSAGE':
      return { ...state, readReceipts: { ...state.readReceipts, [payload.id]: payload.index } };

    default:
      return state;
  }
};
