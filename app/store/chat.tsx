import { createStore } from '~/store/redux-kafka';
import { loadStore } from './redux.server';

type User = {
  id: string;
  name: string;
  color: string;
};

type Message = {
  author: string;
  body: string;
};

export type State = {
  users: { [id: string]: User };
  messages: Message[];
};

export type Action = {
  type: 'NEW_MESSAGE';
  payload: Message;
};

const DEFAULT_STATE = { users: {}, messages: [] };

export const reducer = (state: State, { type, payload }: Action) => {
  switch (type) {
    case 'NEW_MESSAGE':
      // if the body of the message is empty, skip it
      if (!payload.body?.trim()) return state;
      // otherwise, append new message
      return { ...state, messages: [...state.messages, payload] };

    default:
      return state;
  }
};

// server
export const loadChatStore = (key: string) => loadStore(reducer, DEFAULT_STATE, key);

// client
const { Provider, useStore } = createStore('/kafka/sse', reducer, DEFAULT_STATE);

export const ChatProvider = Provider;
export const useChatStore = useStore;
