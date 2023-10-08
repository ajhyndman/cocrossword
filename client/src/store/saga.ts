import { put, takeEvery } from 'redux-saga/effects';

export function* clientSaga() {
  yield takeEvery('INPUT', function* (action) {
    yield put({ type: 'ADVANCE_CURSOR' });
  });
  // yield takeEvery('BACKSPACE', function* (action) {
  //   yield put({ type: 'RETREAT_CURSOR' });
  // });
}
