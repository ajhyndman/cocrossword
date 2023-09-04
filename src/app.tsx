import { readFileSync } from 'fs';
import { join } from 'path';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { parseBinaryFile, unscramble } from '@ajhyndman/puz';

import Test from './views/Test';
import Solver from './views/Solver';

const file = readFileSync(join(__dirname, '../test/nyt_locked.puz'));
let puzzle = parseBinaryFile(file);
puzzle = unscramble(puzzle, '7844');
console.log(puzzle);

const App = () => <Solver puzzle={puzzle} />;

const root = createRoot(document.getElementById('app')!);
root.render(<App />);
