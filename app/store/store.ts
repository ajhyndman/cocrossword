import { legacy_createStore, compose } from 'redux';

import { reducer } from './reducer';

export const createStore = () => {
  const composeEnhancers =
    // @ts-ignore
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = legacy_createStore(reducer, composeEnhancers());
  return store;
};
