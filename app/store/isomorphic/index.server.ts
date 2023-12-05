import { getMessageLog, dispatch } from '~/kafkajs/index';
import {
  Action as RemoteEvent,
  State as RemoteState,
  reducer as remoteReducer,
  DEFAULT_STATE as REMOTE_DEFAULT_STATE,
} from '~/store/remote/index';

export async function loadStore(key: string) {
  const messageLog = await getMessageLog();

  const remoteEvents = messageLog
    .getLog()
    .filter((message) => message.key?.toString() === key)
    .map((message) => JSON.parse(message.value!.toString()));

  function getState(): RemoteState {
    return remoteEvents.reduce(remoteReducer, REMOTE_DEFAULT_STATE);
  }

  return { dispatch: (event: RemoteEvent) => dispatch(key, event), getState };
}
