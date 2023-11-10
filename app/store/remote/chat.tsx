type Message = {
  author: string;
  body: string;
};

export type State = {
  messages: Message[];
};

export type Action = {
  type: 'NEW_MESSAGE';
  payload: Message;
};

export const DEFAULT_STATE = { messages: [] };

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
