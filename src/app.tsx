import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import Test from './views/Test';
import Solver from './views/Solver';
import { createStore } from './store/store';

const store = createStore();

const App = () => (
  <Provider store={store}>
    <Solver />;
  </Provider>
);

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
