export type State = {
  selections: {
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
    };

export const DEFAULT_STATE: State = {
  selections: {},
};

export const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case 'USER_SELECTION_CHANGED':
      return { ...state, selections: { ...state.selections, [payload.id]: payload.index } };

    case 'USER_SELECTION_CLEARED':
      return { ...state, selections: { ...state.selections, [payload.id]: undefined } };

    default:
      return state;
  }
};
