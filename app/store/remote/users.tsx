import { CHAT_COLORS } from '~/util/constants';

export type DeviceType = 'console' | 'mobile' | 'tablet' | 'smarttv' | 'wearable' | 'embedded';

type User = {
  id: string;
  name: string;
  color: string;
  deviceType?: DeviceType;
};

export type State = {
  users: { [id: string]: User };
};

export type Action =
  | {
      type: 'USER_JOINED';
      payload: Pick<User, 'id' | 'name' | 'deviceType'>;
    }
  | {
      type: 'USER_RENAMED';
      payload: { id: string; name: string };
    };

export const DEFAULT_STATE: State = { users: {} };

export const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case 'USER_JOINED':
      // if user already exists, do not recreate them
      if (state.users[payload.id]) return state;

      // otherwise, try to pick a new color
      const userCount = Object.keys(state.users).length;
      const color = CHAT_COLORS[userCount % CHAT_COLORS.length];

      // then insert new user
      return { ...state, users: { ...state.users, [payload.id]: { ...payload, color } } };

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
