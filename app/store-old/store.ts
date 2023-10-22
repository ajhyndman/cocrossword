import { legacy_createStore } from 'redux';

import { reducer } from './reducer';

export const createStore = () => {
  const store = legacy_createStore(reducer);
  return store;
};
