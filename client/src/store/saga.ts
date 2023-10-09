import { eventChannel } from 'redux-saga';
import { call, fork, put, select, takeEvery } from 'redux-saga/effects';

function setupWebSocket(): Promise<WebSocket> {
  // if (ws) return ws;
  const ws = new WebSocket(`ws://${window.location.hostname}:3000`);
  return new Promise((resolve) => {
    ws.addEventListener('open', () => resolve(ws));
  });
}

export function* serverSyncSaga() {
  // open websocket connection
  const ws: WebSocket = yield call(setupWebSocket);

  // subscribe to server actions
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
    yield takeEvery(['INPUT', 'BACKSPACE'], function* (action) {
      const selection = yield select((state) => state.selection);

      console.log(action);
      console.log(selection);

      if (action.type === 'INPUT') {
        ws.send(
          JSON.stringify({
            type: 'SERVER:CELL_CHANGED',
            payload: { index: selection.index, value: action.payload.value },
          }),
        );
      }
      if (action.type === 'BACKSPACE') {
        ws.send(
          JSON.stringify({
            type: 'SERVER:CELL_CHANGED',
            payload: { index: selection.index, value: '-' },
          }),
        );
      }
    });
  });

  yield takeEvery(serverActions, function* (action) {
    // console.log('\n\nreceived from server');
    // console.log(action);
    yield put(action);
  });
}

// export function* clientSaga() {
//   yield takeEvery('INPUT_SERVER', function* (action) {
//     if (action.payload.value === '') {
//       yield put({ type: 'RETREAT_CURSOR' });
//     } else {
//       yield put({ type: 'ADVANCE_CURSOR' });
//     }
//   });
// }
