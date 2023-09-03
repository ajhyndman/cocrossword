import React from 'react';
import { createRoot } from 'react-dom/client';

import UploadView from './UploadView';

const App = () => <UploadView />;

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
