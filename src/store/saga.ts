import { put, takeEvery } from 'redux-saga/effects';

export function* clientSaga() {
  yield takeEvery('INPUT', function* (action) {
    if (action.payload.value === '') {
      yield put({ type: 'RETREAT_CURSOR' });
    } else {
      yield put({ type: 'ADVANCE_CURSOR' });
    }
  });
}
