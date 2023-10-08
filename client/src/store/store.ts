import { legacy_createStore, applyMiddleware, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';

import { reducer } from './reducer';
import { clientSaga } from './saga';

export const createStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const composeEnhancers =
    // @ts-ignore
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  const store = legacy_createStore(
    reducer,
    composeEnhancers(applyMiddleware(sagaMiddleware)),
  );
  sagaMiddleware.run(clientSaga);
  return store;
};
