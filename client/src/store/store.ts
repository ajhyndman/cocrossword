import { legacy_createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { reducer } from './reducer';
import { serverSyncSaga } from './saga';

export const createStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const composeEnhancers =
    // @ts-ignore
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = legacy_createStore(
    reducer,
    composeEnhancers(applyMiddleware(sagaMiddleware)),
  );
  // sagaMiddleware.run(clientSaga);
  sagaMiddleware.run(serverSyncSaga);
  return store;
};
