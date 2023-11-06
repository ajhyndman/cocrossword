import { createStore } from '~/store/redux-kafka';
import { loadStore } from './redux.server';

type User = {
  id: string;
  name: string;
  color: string;
};

export type State = {
  users: { [id: string]: User };
};

export type Action =
  | {
      type: 'USER_JOINED';
      payload: User;
    }
  | {
      type: 'USER_RENAMED';
      payload: { id: string; name: string };
    };

const DEFAULT_STATE = { users: {}, messages: [] };

export const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case 'USER_JOINED':
      // if user already exists, do not recreate them
      if (state.users[payload.id]) return state;
      // otherwise, insert new user
      return { ...state, users: { ...state.users, [payload.id]: payload } };

    case 'USER_RENAMED':
      // if user doesn't exist, bail out
      if (!state.users[payload.id]) return state;
      // otherwise, override only the user's name
      return {
        ...state,
        users: { ...state.users, [payload.id]: { ...state.users[payload.id], name: payload.name } },
      };

    default:
      return state;
  }
};

// server
export const loadUsersStore = (key: string) => loadStore(reducer, DEFAULT_STATE, key);

// client
const { Provider, useStore } = createStore('/kafka/sse', reducer, DEFAULT_STATE);

export const UsersProvider = Provider;
export const useUsersStore = useStore;
