import { eventChannel } from 'redux-saga';
import { call, fork, put, takeEvery } from 'redux-saga/effects';

// let ws;

function setupWebSocket(): Promise<WebSocket> {
  // if (ws) return ws;
  const ws = new WebSocket('ws://localhost:3000');
  return new Promise((resolve) => {
    ws.addEventListener('open', () => resolve(ws));
  });
}

export function* serverSyncSaga() {
  // open websocket connection
  const ws: WebSocket = yield call(setupWebSocket);

  const serverActions = eventChannel((emitter) => {
    const messageHandler = (message: MessageEvent<string>) => {
      // console.log(message);
      emitter(JSON.parse(message.data));
    };
    ws.addEventListener('message', messageHandler);
    return () => ws.removeEventListener('message', messageHandler);
  });

  // write every input and select event to a web socket
  yield fork(function* () {
    yield takeEvery(['INPUT', 'SELECT'], function* (action) {
      ws.send(JSON.stringify(action));
    });
  });

  yield takeEvery(serverActions, function* (action) {
    action.type = action.type + '_SERVER';
    yield put(action);
  });
}

export function* clientSaga() {
  yield takeEvery('INPUT_SERVER', function* (action) {
    if (action.payload.value === '') {
      yield put({ type: 'RETREAT_CURSOR' });
    } else {
      yield put({ type: 'ADVANCE_CURSOR' });
    }
  });
}
