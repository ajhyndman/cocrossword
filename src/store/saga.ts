import { put, takeEvery } from 'redux-saga/effects';
import { Action } from './types';

export function* clientSaga() {
  yield takeEvery('INPUT', function* (action: Action) {
    if (action.payload.value === '-') {
      yield put({ type: 'KEYBOARD_NAVIGATE', payload: { key: 'ArrowLeft' } });
    } else {
      yield put({ type: 'KEYBOARD_NAVIGATE', payload: { key: 'ArrowRight' } });
    }
  });
}
