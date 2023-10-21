import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import Solver from './views/Solver';
import { createStore } from '../../app/store/store';

// disable pinch zoom on iOS devices
document.addEventListener(
  'touchmove',
  (event) => {
    if ('scale' in event && event.scale !== 1) {
      event.preventDefault();
    }
  },
  { passive: false },
);

const store = createStore();

const App = () => (
  <Provider store={store}>
    <Solver />
  </Provider>
);

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
