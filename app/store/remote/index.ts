import { Reducer, createStore } from '~/store/redux-kafka';
import { loadStore as loadStoreGeneric } from '~/store/redux.server';
import {
  Action as ActivityAction,
  State as ActivityState,
  DEFAULT_STATE as ACTIVITY_DEFAULT_STATE,
  reducer as activityReducer,
} from './activity';
import {
  Action as ChatAction,
  State as ChatState,
  DEFAULT_STATE as CHAT_DEFAULT_STATE,
  reducer as chatReducer,
} from './chat';
import {
  Action as PuzzleAction,
  State as PuzzleState,
  DEFAULT_STATE as PUZZLE_DEFAULT_STATE,
  reducer as puzzleReducer,
} from './puzzle';
import {
  Action as UsersAction,
  State as UsersState,
  DEFAULT_STATE as USERS_DEFAULT_STATE,
  reducer as usersReducer,
} from './users';

type Action = ActivityAction | ChatAction | PuzzleAction | UsersAction;

type State = ActivityState & ChatState & PuzzleState & UsersState;

const DEFAULT_STATE = {
  ...ACTIVITY_DEFAULT_STATE,
  ...CHAT_DEFAULT_STATE,
  ...PUZZLE_DEFAULT_STATE,
  ...USERS_DEFAULT_STATE,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const composeReducers = (...reducers: Reducer<any, any>[]): Reducer<any, any> => {
  return reducers.reduce((f, g) => (state, action) => f(g(state, action), action));
};

const reducer: Reducer<State, Action> = composeReducers(
  activityReducer,
  chatReducer,
  puzzleReducer,
  usersReducer,
);

// server
export const loadStore = (key: string) => loadStoreGeneric(reducer, DEFAULT_STATE, key);

// client
export const { Provider, useStore } = createStore('/kafka/sse', reducer, DEFAULT_STATE);
