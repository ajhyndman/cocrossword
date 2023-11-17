import { getMessageLog, dispatch as dispatchEvent } from '~/kafkajs';

type BaseAction = {
  type: string;
  payload?: unknown;
};

type BaseKafkaAction = {
  index: number;
  client: string;
  type: string;
  payload?: unknown;
};

export type Reducer<State, Action extends BaseAction> = (state: State, action: Action) => State;
export type Dispatch<Action extends BaseAction> = (action: Action) => void;

function getKey<Action extends BaseKafkaAction>(action: Action) {
  return `${action.index}:${action.client}`;
}

export async function loadStore<State, Action extends BaseAction>(
  reducer: Reducer<State, Action>,
  init: State,
  key: string,
) {
  const messageLog = await getMessageLog();

  function getActions(): BaseKafkaAction[] {
    return messageLog
      .getLog()
      .filter((message) => message.key?.toString() === key)
      .map((message) => JSON.parse(message.value!.toString()));
  }

  function getCursor(): number {
    return getActions().reduce((cursor, action) => Math.max(action.index, cursor), -1);
  }

  function getState(): State {
    const actions = getActions();
    actions.sort((a, b) => getKey(a).localeCompare(getKey(b)));
    // @ts-expect-error accept this cast
    const state = (actions as Action[]).reduce(reducer, init);

    return state;
  }

  async function dispatch(action: Action) {
    const cursor = getCursor();

    return await dispatchEvent(key, {
      index: cursor + 1,
      client: 'SERVER',
      ...action,
    });
  }

  return { dispatch, getState };
}
