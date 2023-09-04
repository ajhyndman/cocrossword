import React from 'react';
import { createRoot } from 'react-dom/client';

import Test from './views/Test';

const App = () => <Test />;

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
